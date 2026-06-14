import {
  UserRole,
  RentalContractStatus,
  VehicleStatus,
  InspectionType,
  FineStatus,
} from "@prisma/client";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrateur",
  [UserRole.STAFF]: "Employé",
};

export const RENTAL_CONTRACT_STATUS_LABELS: Record<
  RentalContractStatus,
  string
> = {
  [RentalContractStatus.DRAFT]: "Brouillon",
  [RentalContractStatus.ACTIVE]: "En cours",
  [RentalContractStatus.COMPLETED]: "Terminé",
  [RentalContractStatus.CANCELLED]: "Annulé",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  [VehicleStatus.AVAILABLE]: "Disponible",
  [VehicleStatus.RENTED]: "Loué",
  [VehicleStatus.MAINTENANCE]: "Maintenance",
  [VehicleStatus.UNAVAILABLE]: "Indisponible",
};

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  [InspectionType.CHECKOUT]: "Départ",
  [InspectionType.CHECKIN]: "Retour",
};

export const FINE_STATUS_LABELS: Record<FineStatus, string> = {
  [FineStatus.NEW]: "Nouvelle",
  [FineStatus.MATCHED]: "Rapprochée",
  [FineStatus.SENT]: "Transmise",
  [FineStatus.PAID]: "Payée",
  [FineStatus.DISPUTED]: "Contestée",
};

/** Statuts considérés comme non traités pour le dashboard */
export const UNPROCESSED_FINE_STATUSES: FineStatus[] = [
  FineStatus.NEW,
  FineStatus.MATCHED,
];

/** Contract statuses that block vehicle availability for overlap checks */
export const BLOCKING_CONTRACT_STATUSES: RentalContractStatus[] = [
  RentalContractStatus.DRAFT,
  RentalContractStatus.ACTIVE,
];
