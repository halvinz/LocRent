import { RentalContractStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { normalizeLicensePlate } from "@/config/fines";

export interface ResponsibleRenterMatch {
  vehicle: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
  contract: {
    id: string;
    contractNumber: string | null;
    status: RentalContractStatus;
    startAt: Date;
    expectedEndAt: Date;
    actualEndAt: Date | null;
    effectiveEndAt: Date;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    drivingLicenseNumber: string | null;
  };
}

export interface FineMatchResult {
  match: ResponsibleRenterMatch | null;
  conflict: boolean;
  conflictCount: number;
  vehicleFound: boolean;
  message: string;
}

const MATCHABLE_STATUSES: RentalContractStatus[] = [
  RentalContractStatus.ACTIVE,
  RentalContractStatus.COMPLETED,
];

function getEffectiveEndAt(contract: {
  status: RentalContractStatus;
  expectedEndAt: Date;
  actualEndAt: Date | null;
}): Date {
  if (contract.status === RentalContractStatus.COMPLETED) {
    return contract.actualEndAt ?? contract.expectedEndAt;
  }
  return contract.expectedEndAt;
}

function isViolationInContractPeriod(
  violationAt: Date,
  contract: {
    startAt: Date;
    status: RentalContractStatus;
    expectedEndAt: Date;
    actualEndAt: Date | null;
  },
): boolean {
  const endAt = getEffectiveEndAt(contract);
  return violationAt >= contract.startAt && violationAt <= endAt;
}

function contractPriority(status: RentalContractStatus): number {
  if (status === RentalContractStatus.ACTIVE) return 0;
  if (status === RentalContractStatus.COMPLETED) return 1;
  return 99;
}

/**
 * Trouve le locataire responsable d'une amende à partir de la plaque et du timestamp.
 * Priorité : contrats ACTIVE puis COMPLETED couvrant violationAt.
 */
export async function findResponsibleRenterForFine(params: {
  companyId: string;
  licensePlate: string;
  violationAt: Date;
}): Promise<FineMatchResult> {
  const { companyId, violationAt } = params;
  const licensePlate = normalizeLicensePlate(params.licensePlate);

  const vehicle = await prisma.vehicle.findUnique({
    where: { companyId_licensePlate: { companyId, licensePlate } },
    select: { id: true, licensePlate: true, make: true, model: true },
  });

  if (!vehicle) {
    return {
      match: null,
      conflict: false,
      conflictCount: 0,
      vehicleFound: false,
      message: "Aucun véhicule trouvé pour cette plaque dans votre parc.",
    };
  }

  const contracts = await prisma.rentalContract.findMany({
    where: {
      companyId,
      vehicleId: vehicle.id,
      status: { in: MATCHABLE_STATUSES },
      startAt: { lte: violationAt },
    },
    include: {
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
    },
    orderBy: { startAt: "desc" },
  });

  const matching = contracts
    .filter((c) => isViolationInContractPeriod(violationAt, c))
    .sort((a, b) => contractPriority(a.status) - contractPriority(b.status));

  if (matching.length === 0) {
    return {
      match: null,
      conflict: false,
      conflictCount: 0,
      vehicleFound: true,
      message:
        "Véhicule trouvé, mais aucun contrat actif ou terminé ne couvre cette date/heure.",
    };
  }

  if (matching.length > 1) {
    const samePriority = matching.filter(
      (c) => contractPriority(c.status) === contractPriority(matching[0]!.status),
    );
    if (samePriority.length > 1) {
      return {
        match: null,
        conflict: true,
        conflictCount: samePriority.length,
        vehicleFound: true,
        message: `${samePriority.length} contrats correspondent à cette période. Rapprochement manuel requis.`,
      };
    }
  }

  const contract = matching[0]!;
  const effectiveEndAt = getEffectiveEndAt(contract);

  return {
    match: {
      vehicle: {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        make: vehicle.make,
        model: vehicle.model,
      },
      contract: {
        id: contract.id,
        contractNumber: contract.contractNumber,
        status: contract.status,
        startAt: contract.startAt,
        expectedEndAt: contract.expectedEndAt,
        actualEndAt: contract.actualEndAt,
        effectiveEndAt,
      },
      client: contract.client,
    },
    conflict: false,
    conflictCount: 0,
    vehicleFound: true,
    message: "Locataire identifié avec succès.",
  };
}

/** @deprecated Use findResponsibleRenterForFine */
export async function findContractAtDatetime(params: {
  companyId: string;
  plateNumber: string;
  offenseAt: Date;
}) {
  const result = await findResponsibleRenterForFine({
    companyId: params.companyId,
    licensePlate: params.plateNumber,
    violationAt: params.offenseAt,
  });
  if (!result.match) return null;
  const { contract, client, vehicle } = result.match;
  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    startAt: contract.startAt,
    expectedEndAt: contract.expectedEndAt,
    client,
    vehicle,
  };
}
