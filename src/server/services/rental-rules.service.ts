import { RentalContractStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { BLOCKING_CONTRACT_STATUSES } from "@/types/enums";
import { ConflictError, ValidationError } from "@/lib/errors";

interface OverlapCheckParams {
  companyId: string;
  vehicleId: string;
  startAt: Date;
  expectedEndAt: Date;
  excludeContractId?: string;
}

/** Bloque si un contrat DRAFT ou ACTIVE chevauche la période demandée. */
export async function assertNoVehicleOverlap(
  params: OverlapCheckParams,
): Promise<void> {
  const { companyId, vehicleId, startAt, expectedEndAt, excludeContractId } =
    params;

  if (startAt >= expectedEndAt) {
    throw new ValidationError(
      "La date de fin prévue doit être postérieure à la date de début",
    );
  }

  const overlapping = await prisma.rentalContract.findFirst({
    where: {
      companyId,
      vehicleId,
      status: { in: BLOCKING_CONTRACT_STATUSES },
      ...(excludeContractId ? { id: { not: excludeContractId } } : {}),
      startAt: { lt: expectedEndAt },
      expectedEndAt: { gt: startAt },
    },
    select: { id: true, contractNumber: true, status: true },
  });

  if (overlapping) {
    throw new ConflictError(
      `Le véhicule est déjà réservé sur cette période${overlapping.contractNumber ? ` (contrat ${overlapping.contractNumber})` : ""} — statut ${overlapping.status}`,
    );
  }
}

export function assertMileageCoherence(params: {
  startMileage?: number | null;
  endMileage?: number | null;
  expectedReturnMileage?: number | null;
}): void {
  const { startMileage, endMileage, expectedReturnMileage } = params;

  if (
    startMileage != null &&
    expectedReturnMileage != null &&
    expectedReturnMileage < startMileage
  ) {
    throw new ValidationError(
      "Le kilométrage prévu au retour doit être supérieur ou égal au kilométrage de départ",
    );
  }

  if (startMileage != null && endMileage != null && endMileage < startMileage) {
    throw new ValidationError(
      "Le kilométrage de retour doit être supérieur ou égal au kilométrage de départ",
    );
  }
}

export { findContractAtDatetime } from "./fine-matching.service";
