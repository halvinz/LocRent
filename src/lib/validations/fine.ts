import { z } from "zod";
import { FineStatus } from "@prisma/client";
import { VIOLATION_TYPES } from "@/config/fines";
import { optionalDateString } from "./common";

const optionalDecimal = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
    return Number.isNaN(n) ? undefined : n;
  })
  .pipe(z.number().positive("Montant invalide"));

export const fineMatchSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .min(1, "Plaque requise")
    .max(20),
  violationAt: z
    .string()
    .min(1, "Date/heure requise")
    .transform((v) => {
      const d = optionalDateString(v);
      if (!d) throw new Error("Date/heure invalide");
      return d;
    }),
});

export type FineMatchInput = z.infer<typeof fineMatchSchema>;

export const fineFormSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .min(1, "Plaque requise")
    .max(20),
  violationAt: z
    .string()
    .min(1, "Date/heure requise")
    .transform((v) => {
      const d = optionalDateString(v);
      if (!d) throw new Error("Date/heure invalide");
      return d;
    }),
  violationType: z
    .enum(VIOLATION_TYPES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => {
      const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
      if (Number.isNaN(n)) throw new Error("Montant requis");
      return n;
    })
    .pipe(z.number().positive("Montant invalide")),
  referenceNumber: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  issuingAuthority: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  rentalContractId: z.string().optional(),
  vehicleId: z.string().optional(),
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
