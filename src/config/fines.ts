export const VIOLATION_TYPES = [
  "Excès de vitesse",
  "Stationnement",
  "Feu rouge",
  "Téléphone au volant",
  "Non-port ceinture",
  "Zone piétonne",
  "Autre",
] as const;

export type ViolationType = (typeof VIOLATION_TYPES)[number];

export function normalizeLicensePlate(plate: string): string {
  return plate.toUpperCase().replace(/\s+/g, "").trim();
}
