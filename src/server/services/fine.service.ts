import { FineStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { normalizeLicensePlate } from "@/config/fines";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import type { FineFormOutput, FineSearchInput } from "@/lib/validations/fine";
import { findResponsibleRenterForFine } from "./fine-matching.service";

const fineInclude = {
  vehicle: {
    select: { id: true, licensePlate: true, make: true, model: true },
  },
  rentalContract: {
    select: {
      id: true,
      contractNumber: true,
      startAt: true,
      expectedEndAt: true,
      actualEndAt: true,
      status: true,
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          drivingLicenseNumber: true,
        },
      },
    },
  },
} satisfies Prisma.FineInclude;

function buildWhere(companyId: string, params: FineSearchInput): Prisma.FineWhereInput {
  const where: Prisma.FineWhereInput = { companyId };
  if (params.status) where.status = params.status;
  if (params.q) {
    where.OR = [
      { licensePlate: { contains: params.q, mode: "insensitive" } },
      { referenceNumber: { contains: params.q, mode: "insensitive" } },
      { violationType: { contains: params.q, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function listFines(companyId: string, params: FineSearchInput) {
  const where = buildWhere(companyId, params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.fine.findMany({
      where,
      orderBy: { violationAt: "desc" },
      skip,
      take: params.pageSize,
      include: fineInclude,
    }),
    prisma.fine.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function getFineById(companyId: string, id: string) {
  const fine = await prisma.fine.findFirst({
    where: { id, companyId },
    include: fineInclude,
  });
  if (!fine) throw new NotFoundError("Amende introuvable");
  return fine;
}

export async function createFine(companyId: string, data: FineFormOutput) {
  const licensePlate = normalizeLicensePlate(data.licensePlate);

  let vehicleId = data.vehicleId;
  let rentalContractId = data.rentalContractId;
  let status: FineStatus = FineStatus.NEW;

  if (!rentalContractId) {
    const matchResult = await findResponsibleRenterForFine({
      companyId,
      licensePlate,
      violationAt: data.violationAt,
    });
    if (matchResult.match) {
      vehicleId = matchResult.match.vehicle.id;
      rentalContractId = matchResult.match.contract.id;
      status = FineStatus.MATCHED;
    }
  } else if (vehicleId) {
    status = FineStatus.MATCHED;
  }

  return prisma.fine.create({
    data: {
      companyId,
      licensePlate,
      violationAt: data.violationAt,
      violationType: data.violationType,
      amount: data.amount,
      referenceNumber: data.referenceNumber,
      issuingAuthority: data.issuingAuthority,
      notes: data.notes,
      vehicleId: vehicleId ?? null,
      rentalContractId: rentalContractId ?? null,
      status,
      matchedAt: status === FineStatus.MATCHED ? new Date() : null,
    },
    include: fineInclude,
  });
}

export async function linkFineToContract(
  companyId: string,
  fineId: string,
  rentalContractId: string,
  vehicleId: string,
) {
  await getFineById(companyId, fineId);

  const contract = await prisma.rentalContract.findFirst({
    where: { id: rentalContractId, companyId, vehicleId },
    select: { id: true },
  });

  if (!contract) {
    throw new ValidationError("Contrat ou véhicule invalide pour cette société");
  }

  return prisma.fine.update({
    where: { id: fineId },
    data: {
      rentalContractId,
      vehicleId,
      status: FineStatus.MATCHED,
      matchedAt: new Date(),
    },
    include: fineInclude,
  });
}

export async function updateFineStatus(
  companyId: string,
  fineId: string,
  status: FineStatus,
) {
  await getFineById(companyId, fineId);
  return prisma.fine.update({
    where: { id: fineId },
    data: { status },
    include: fineInclude,
  });
}

export async function deleteFine(companyId: string, fineId: string) {
  const fine = await getFineById(companyId, fineId);

  if (fine.status === FineStatus.PAID) {
    throw new ConflictError(
      "Une amende payée ne peut pas être supprimée (historique comptable)",
    );
  }

  await prisma.fine.delete({ where: { id: fineId } });
}

export async function getDashboardFineStats(companyId: string) {
  const [unprocessedCount, recentFines, recentMatches] = await Promise.all([
    prisma.fine.count({
      where: {
        companyId,
        status: { in: [FineStatus.NEW, FineStatus.MATCHED] },
      },
    }),
    prisma.fine.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: fineInclude,
    }),
    prisma.fine.findMany({
      where: { companyId, status: FineStatus.MATCHED },
      orderBy: { matchedAt: "desc" },
      take: 5,
      include: fineInclude,
    }),
  ]);

  return { unprocessedCount, recentFines, recentMatches };
}

export async function matchFinePreview(
  companyId: string,
  licensePlate: string,
  violationAt: Date,
) {
  return findResponsibleRenterForFine({ companyId, licensePlate, violationAt });
}
