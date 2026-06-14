import { InspectionType, RentalContractStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import type { InspectionFormOutput } from "@/lib/validations/inspection";
import { getContractById } from "./contract.service";
import { assertMileageCoherence } from "./rental-rules.service";

export async function upsertInspection(
  companyId: string,
  contractId: string,
  userId: string,
  data: InspectionFormOutput,
) {
  const contract = await getContractById(companyId, contractId);

  if (data.type === InspectionType.CHECKOUT) {
    if (
      contract.status !== RentalContractStatus.DRAFT &&
      contract.status !== RentalContractStatus.ACTIVE
    ) {
      throw new ConflictError(
        "L'état des lieux départ n'est possible que sur un brouillon ou contrat actif",
      );
    }
  }

  if (data.type === InspectionType.CHECKIN) {
    if (contract.status !== RentalContractStatus.ACTIVE) {
      throw new ConflictError(
        "L'état des lieux retour n'est possible que sur un contrat actif",
      );
    }
  }

  if (contract.startMileage != null && data.mileage < contract.startMileage) {
    throw new ValidationError(
      "Le kilométrage ne peut pas être inférieur au kilométrage de départ du contrat",
    );
  }

  assertMileageCoherence({
    startMileage: contract.startMileage,
    endMileage: data.type === InspectionType.CHECKIN ? data.mileage : undefined,
  });

  const existing = await prisma.inspection.findUnique({
    where: {
      rentalContractId_type: {
        rentalContractId: contractId,
        type: data.type,
      },
    },
  });

  const inspectionData = {
    companyId,
    rentalContractId: contractId,
    vehicleId: contract.vehicleId,
    createdById: userId,
    type: data.type,
    mileage: data.mileage,
    fuelLevel: data.fuelLevel,
    notes: data.notes,
    damageSummary: data.damageSummary,
    checklist: data.checklist,
  };

  const inspection = existing
    ? await prisma.inspection.update({
        where: { id: existing.id },
        data: inspectionData,
      })
    : await prisma.inspection.create({ data: inspectionData });

  await prisma.inspectionPhoto.deleteMany({
    where: { inspectionId: inspection.id },
  });

  if (data.photos.length > 0) {
    await prisma.inspectionPhoto.createMany({
      data: data.photos.map((photo, index) => ({
        companyId,
        inspectionId: inspection.id,
        url: photo.url,
        caption: photo.caption,
        sortOrder: index,
      })),
    });
  }

  const contractUpdate =
    data.type === InspectionType.CHECKOUT
      ? {
          startMileage: data.mileage,
          startFuelLevel: data.fuelLevel,
        }
      : {
          endMileage: data.mileage,
          endFuelLevel: data.fuelLevel,
        };

  await prisma.rentalContract.update({
    where: { id: contractId },
    data: contractUpdate,
  });

  return prisma.inspection.findFirst({
    where: { id: inspection.id, companyId },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getInspection(
  companyId: string,
  contractId: string,
  type: InspectionType,
) {
  const inspection = await prisma.inspection.findFirst({
    where: { companyId, rentalContractId: contractId, type },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!inspection) throw new NotFoundError("État des lieux introuvable");
  return inspection;
}

export async function getInspectionsOverview(companyId: string) {
  const [contracts, recentInspections] = await Promise.all([
    prisma.rentalContract.findMany({
      where: {
        companyId,
        status: {
          in: [RentalContractStatus.DRAFT, RentalContractStatus.ACTIVE],
        },
      },
      orderBy: { startAt: "desc" },
      include: {
        client: { select: { firstName: true, lastName: true } },
        vehicle: {
          select: { licensePlate: true, make: true, model: true },
        },
        inspections: {
          select: { type: true, performedAt: true },
        },
      },
    }),
    prisma.inspection.findMany({
      where: { companyId },
      orderBy: { performedAt: "desc" },
      take: 10,
      include: {
        rentalContract: {
          select: {
            id: true,
            contractNumber: true,
            client: { select: { firstName: true, lastName: true } },
            vehicle: { select: { licensePlate: true } },
          },
        },
      },
    }),
  ]);

  const queue = contracts.map((contract) => {
    const hasCheckout = contract.inspections.some(
      (i) => i.type === InspectionType.CHECKOUT,
    );
    const hasCheckin = contract.inspections.some(
      (i) => i.type === InspectionType.CHECKIN,
    );

    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      status: contract.status,
      startAt: contract.startAt,
      clientName: `${contract.client.lastName} ${contract.client.firstName}`,
      vehicleLabel: `${contract.vehicle.licensePlate} — ${contract.vehicle.make} ${contract.vehicle.model}`,
      hasCheckout,
      hasCheckin,
      needsCheckout:
        !hasCheckout &&
        (contract.status === RentalContractStatus.DRAFT ||
          contract.status === RentalContractStatus.ACTIVE),
      needsCheckin:
        !hasCheckin && contract.status === RentalContractStatus.ACTIVE,
    };
  });

  return { queue, recentInspections };
}
