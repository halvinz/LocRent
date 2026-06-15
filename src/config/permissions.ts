import { StaffPermission } from "@prisma/client";

export const ALL_STAFF_PERMISSIONS: StaffPermission[] = [
  StaffPermission.CLIENTS,
  StaffPermission.VEHICLES,
  StaffPermission.CONTRACTS,
  StaffPermission.INSPECTIONS,
  StaffPermission.FINES,
];

export const PERMISSION_META: Record<
  StaffPermission,
  { label: string; description: string }
> = {
  [StaffPermission.CLIENTS]: {
    label: "Clients",
    description: "Consulter, créer et modifier les clients",
  },
  [StaffPermission.VEHICLES]: {
    label: "Véhicules",
    description: "Gérer le parc automobile",
  },
  [StaffPermission.CONTRACTS]: {
    label: "Contrats",
    description: "Créer et gérer les contrats de location",
  },
  [StaffPermission.INSPECTIONS]: {
    label: "États des lieux",
    description: "Réaliser les états des lieux départ et retour",
  },
  [StaffPermission.FINES]: {
    label: "Amendes",
    description: "Saisir et suivre les amendes",
  },
};

/** Nav href → permission required (dashboard and settings excluded). */
export const ROUTE_PERMISSIONS: Record<string, StaffPermission | StaffPermission[]> = {
  "/dashboard/clients": StaffPermission.CLIENTS,
  "/dashboard/vehicles": StaffPermission.VEHICLES,
  "/dashboard/contracts": StaffPermission.CONTRACTS,
  "/dashboard/inspections": [
    StaffPermission.INSPECTIONS,
    StaffPermission.CONTRACTS,
  ],
  "/dashboard/fines": StaffPermission.FINES,
};

export function permissionForUploadFolder(
  folder: string,
): StaffPermission | null {
  if (folder === "licenses") return StaffPermission.CLIENTS;
  if (folder === "inspections") return StaffPermission.INSPECTIONS;
  return null;
}
