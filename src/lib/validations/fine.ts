import { z } from "zod";
import { FineStatus } from "@prisma/client";
import { VIOLATION_TYPES } from "@/config/fines";
import { createRequiredDateTimeSchema, emptyToUndefined } from "./common";

function emptyNumberToUndefined(value: unknown): unknown {
  if (value === null || value === undefined || value === "") return undefined;
  return value;
}

const requiredAmount = z.preprocess(
  emptyNumberToUndefined,
  z
    .union([z.string(), z.number()])
    .transform((v) => {
      if (v === undefined) throw new Error("Montant requis");
      const n =
        typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
      if (Number.isNaN(n)) throw new Error("Montant requis");
      return n;
    })
    .pipe(
      z
        .number({ invalid_type_error: "Montant invalide" })
        .positive("Montant invalide"),
    ),
);

const optionalViolationType = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.enum(VIOLATION_TYPES).optional(),
);

const optionalId = z
  .string()
  .optional()
  .transform((v) => emptyToUndefined(v));

export const fineMatchSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .min(1, "Plaque requise")
    .max(20),
  violationAt: createRequiredDateTimeSchema("Date/heure de l'infraction"),
});

export type FineMatchInput = z.infer<typeof fineMatchSchema>;

export const fineFormSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .min(1, "Plaque requise")
    .max(20),
  violationAt: createRequiredDateTimeSchema("Date/heure de l'infraction"),
  violationType: optionalViolationType,
  amount: requiredAmount,
  referenceNumber: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => emptyToUndefined(v)),
  issuingAuthority: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => emptyToUndefined(v)),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => emptyToUndefined(v)),
  rentalContractId: optionalId,
  vehicleId: optionalId,
});

export type FineFormInput = z.input<typeof fineFormSchema>;
export type FineFormOutput = z.infer<typeof fineFormSchema>;

export const fineSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().optional(),
  status: z.nativeEnum(FineStatus).optional(),
});

export type FineSearchInput = z.infer<typeof fineSearchSchema>;

export const linkFineSchema = z.object({
  rentalContractId: z.string().min(1),
  vehicleId: z.string().min(1),
});

export const updateFineStatusSchema = z.object({
  status: z.nativeEnum(FineStatus),
});
