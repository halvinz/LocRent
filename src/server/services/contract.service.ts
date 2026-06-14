import {
  InspectionType,
  RentalContractStatus,
  VehicleStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_CONTRACT_TERMS } from "@/config/inspection";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type {
  ContractFormOutput,
  ContractSearchInput,
  CompleteContractInput,
} from "@/lib/validations/contract";
import {
  assertMileageCoherence,
  assertNoVehicleOverlap,
} from "./rental-rules.service";

const contractInclude = {
  client: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      drivingLicenseNumber: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      licensePlate: true,
      make: true,
      model: true,
      year: true,
      currentMileage: true,
      status: true,
    },
  },
  inspections: {
    include: { photos: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { performedAt: "asc" as const },
  },
} satisfies Prisma.RentalContractInclude;

export async function generateContractNumber(
  companyId: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CTR-${year}-`;

  const last = await prisma.rentalContract.findFirst({
    where: {
      companyId,
      contractNumber: { startsWith: prefix },
    },
    orderBy: { contractNumber: "desc" },
    select: { contractNumber: true },
  });

  const lastSeq = last?.contractNumber
    ? parseInt(last.contractNumber.replace(prefix, ""), 10)
    : 0;

  const next = Number.isNaN(lastSeq) ? 1 : lastSeq + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}

function buildSearchWhere(
  companyId: string,
  params: ContractSearchInput,
): Prisma.RentalContractWhereInput {
  const { q, status, clientId, vehicleId, dateFrom, dateTo } = params;

  const where: Prisma.RentalContractWhereInput = { companyId };

  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (vehicleId) where.vehicleId = vehicleId;

  if (dateFrom || dateTo) {
    where.AND = [];
    if (dateFrom) {
      (where.AND as Prisma.RentalContractWhereInput[]).push({
        expectedEndAt: { gte: dateFrom },
      });
    }
    if (dateTo) {
      (where.AND as Prisma.RentalContractWhereInput[]).push({
        startAt: { lte: dateTo },
      });
    }
  }

  if (q) {
    where.OR = [
      { contractNumber: { contains: q, mode: "insensitive" } },
      { client: { firstName: { contains: q, mode: "insensitive" } } },
      { client: { lastName: { contains: q, mode: "insensitive" } } },
      { vehicle: { licensePlate: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function listContracts(
  companyId: string,
  params: ContractSearchInput,
) {
  const where = buildSearchWhere(companyId, params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.rentalContract.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip,
      take: params.pageSize,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        vehicle: {
          select: { id: true, licensePlate: true, make: true, model: true },
        },
      },
    }),
    prisma.rentalContract.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function getContractById(companyId: string, id: string) {
  const contract = await prisma.rentalContract.findFirst({
    where: { id, companyId },
    include: {
      ...contractInclude,
      company: {
        select: { id: true, name: true, email: true, phone: true, address: true },
      },
    },
  });

  if (!contract) throw new NotFoundError("Contrat introuvable");
  return contract;
}

async function assertEntitiesBelongToCompany(
  companyId: string,
  clientId: string,
  vehicleId: string,
) {
  const [client, vehicle] = await Promise.all([
    prisma.client.findFirst({
      where: { id: clientId, companyId, isActive: true },
    }),
    prisma.vehicle.findFirst({
      where: { id: vehicleId, companyId, isActive: true },
    }),
  ]);

  if (!client) throw new ValidationError("Client invalide ou inactif");
  if (!vehicle) throw new ValidationError("Véhicule invalide ou inactif");
  return { client, vehicle };
}

export async function createContract(
  companyId: string,
  data: ContractFormOutput,
) {
  await assertEntitiesBelongToCompany(companyId, data.clientId, data.vehicleId);

  if (!data.startAt || !data.expectedEndAt) {
    throw new ValidationError("Dates de début et fin requises");
  }

  assertMileageCoherence({
    startMileage: data.startMileage,
    expectedReturnMileage: data.expectedReturnMileage,
  });

  await assertNoVehicleOverlap({
    companyId,
    vehicleId: data.vehicleId,
    startAt: data.startAt,
    expectedEndAt: data.expectedEndAt,
  });

  const contractNumber = await generateContractNumber(companyId);

  return prisma.rentalContract.create({
    data: {
      companyId,
      contractNumber,
      status: RentalContractStatus.DRAFT,
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      startAt: data.startAt,
      expectedEndAt: data.expectedEndAt,
      dailyPrice: data.dailyPrice,
      depositAmount: data.depositAmount,
      includedMileage: data.includedMileage,
      extraMileagePrice: data.extraMileagePrice,
      startMileage: data.startMileage,
      expectedReturnMileage: data.expectedReturnMileage,
      startFuelLevel: data.startFuelLevel,
      terms: data.terms ?? DEFAULT_CONTRACT_TERMS,
    },
    include: contractInclude,
  });
}

export async function updateContract(
  companyId: string,
  id: string,
  data: ContractFormOutput,
) {
  const existing = await getContractById(companyId, id);

  if (existing.status !== RentalContractStatus.DRAFT) {
    throw new ConflictError("Seuls les brouillons peuvent être modifiés");
  }

  await assertEntitiesBelongToCompany(companyId, data.clientId, data.vehicleId);

  if (!data.startAt || !data.expectedEndAt) {
    throw new ValidationError("Dates de début et fin requises");
  }

  assertMileageCoherence({
    startMileage: data.startMileage,
    expectedReturnMileage: data.expectedReturnMileage,
  });

  await assertNoVehicleOverlap({
    companyId,
    vehicleId: data.vehicleId,
    startAt: data.startAt,
    expectedEndAt: data.expectedEndAt,
    excludeContractId: id,
  });

  return prisma.rentalContract.update({
    where: { id },
    data,
    include: contractInclude,
  });
}

export async function activateContract(companyId: string, id: string) {
  const contract = await getContractById(companyId, id);

  if (contract.status !== RentalContractStatus.DRAFT) {
    throw new ConflictError("Seul un brouillon peut être activé");
  }

  await assertNoVehicleOverlap({
    companyId,
    vehicleId: contract.vehicleId,
    startAt: contract.startAt,
    expectedEndAt: contract.expectedEndAt,
    excludeContractId: id,
  });

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rentalContract.update({
      where: { id },
      data: { status: RentalContractStatus.ACTIVE },
      include: contractInclude,
    });

    await tx.vehicle.updateMany({
      where: { id: contract.vehicleId, companyId },
      data: { status: VehicleStatus.RENTED },
    });

    return updated;
  });
}

export async function completeContract(
  companyId: string,
  id: string,
  input: CompleteContractInput,
) {
  const contract = await getContractById(companyId, id);

  if (contract.status !== RentalContractStatus.ACTIVE) {
    throw new ConflictError("Seul un contrat actif peut être clôturé");
  }

  assertMileageCoherence({
    startMileage: contract.startMileage,
    endMileage: input.endMileage,
  });

  if (!input.actualEndAt) {
    throw new ValidationError("Date de retour requise");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rentalContract.update({
      where: { id },
      data: {
        status: RentalContractStatus.COMPLETED,
        actualEndAt: input.actualEndAt,
        endMileage: input.endMileage,
        endFuelLevel: input.endFuelLevel,
      },
      include: contractInclude,
    });

    await tx.vehicle.updateMany({
      where: { id: contract.vehicleId, companyId },
      data: {
        status: VehicleStatus.AVAILABLE,
        ...(input.endMileage != null ? { currentMileage: input.endMileage } : {}),
      },
    });

    return updated;
  });
}

export async function cancelContract(companyId: string, id: string) {
  const contract = await getContractById(companyId, id);

  if (
    contract.status !== RentalContractStatus.DRAFT &&
    contract.status !== RentalContractStatus.ACTIVE
  ) {
    throw new ConflictError("Ce contrat ne peut plus être annulé");
  }

  const wasActive = contract.status === RentalContractStatus.ACTIVE;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rentalContract.update({
      where: { id },
      data: { status: RentalContractStatus.CANCELLED },
      include: contractInclude,
    });

    if (wasActive) {
      await tx.vehicle.updateMany({
        where: { id: contract.vehicleId, companyId },
        data: { status: VehicleStatus.AVAILABLE },
      });
    }

    return updated;
  });
}

export async function deleteContract(companyId: string, id: string) {
  const contract = await getContractById(companyId, id);

  if (
    contract.status !== RentalContractStatus.DRAFT &&
    contract.status !== RentalContractStatus.CANCELLED
  ) {
    throw new ConflictError(
      "Seuls les brouillons et contrats annulés peuvent être supprimés",
    );
  }

  await prisma.rentalContract.delete({ where: { id } });
}

export async function getContractFormOptions(companyId: string) {
  const [clients, vehicles] = await Promise.all([
    prisma.client.findMany({
      where: { companyId, isActive: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.vehicle.findMany({
      where: { companyId, isActive: true },
      orderBy: { licensePlate: "asc" },
      select: {
        id: true,
        licensePlate: true,
        make: true,
        model: true,
        currentMileage: true,
        status: true,
      },
    }),
  ]);

  return { clients, vehicles };
}

export function getInspectionByType(
  contract: Awaited<ReturnType<typeof getContractById>>,
  type: InspectionType,
) {
  return contract.inspections.find((i) => i.type === type) ?? null;
}
