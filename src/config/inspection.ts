export const INSPECTION_CHECKLIST_ITEMS = [
  { key: "exterior", label: "Carrosserie" },
  { key: "windshield", label: "Pare-brise" },
  { key: "tires", label: "Pneus" },
  { key: "lights", label: "Éclairage" },
  { key: "interior", label: "Intérieur" },
  { key: "documents", label: "Documents véhicule" },
] as const;

export type ChecklistKey = (typeof INSPECTION_CHECKLIST_ITEMS)[number]["key"];

export const CHECKLIST_STATUS_OPTIONS = [
  { value: "ok", label: "OK" },
  { value: "damaged", label: "Endommagé" },
  { value: "missing", label: "Manquant" },
  { value: "na", label: "N/A" },
] as const;

export type ChecklistStatus = (typeof CHECKLIST_STATUS_OPTIONS)[number]["value"];

export type InspectionChecklist = Partial<Record<ChecklistKey, ChecklistStatus>>;

export const DEFAULT_CONTRACT_TERMS = `Le locataire s'engage à restituer le véhicule dans l'état où il l'a reçu, avec le niveau de carburant convenu.
Tout dommage, amende ou kilométrage excédentaire sera facturé au locataire.
Le dépôt de garantie pourra être retenu en cas de non-respect des conditions.`;
