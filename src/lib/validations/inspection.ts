import { InspectionType } from "@prisma/client";
import { z } from "zod";
import {
  CHECKLIST_STATUS_OPTIONS,
  INSPECTION_CHECKLIST_ITEMS,
} from "@/config/inspection";

const checklistValues = CHECKLIST_STATUS_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

const checklistSchema = z
  .record(z.enum(checklistValues))
  .optional()
  .transform((v) => v ?? {});

const photoSchema = z.object({
  url: z.string().url("URL photo invalide"),
  caption: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const inspectionFormSchema = z.object({
  type: z.nativeEnum(InspectionType),
  mileage: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      const n = typeof v === "number" ? v : parseInt(v, 10);
      return Number.isNaN(n) ? undefined : n;
    })
    .pipe(z.number().int().min(0, "Kilométrage invalide")),
  fuelLevel: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      const n = typeof v === "number" ? v : parseInt(v, 10);
      return Number.isNaN(n) ? undefined : n;
    })
    .pipe(z.number().int().min(0).max(100, "Niveau carburant entre 0 et 100")),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  damageSummary: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  checklist: checklistSchema,
  photos: z.array(photoSchema).max(10).default([]),
});

export type InspectionFormInput = z.input<typeof inspectionFormSchema>;
export type InspectionFormOutput = z.infer<typeof inspectionFormSchema>;

export { INSPECTION_CHECKLIST_ITEMS };
