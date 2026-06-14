import { RentalContractStatus } from "@prisma/client";
import { z } from "zod";
import {
  createRequiredDateTimeSchema,
  optionalDateString,
} from "./common";

function emptyNumberToUndefined(value: unknown): unknown {
  if (value === null || value === undefined || value === "") return undefined;
  return value;
}

const optionalDecimal = z.preprocess(
  emptyNumberToUndefined,
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const n =
        typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
      return Number.isNaN(n) ? undefined : n;
    })
    .pipe(
      z
        .number({ invalid_type_error: "Montant invalide" })
        .min(0, "Le montant doit être positif ou nul")
        .optional(),
    ),
);

const optionalInt = z.preprocess(
  emptyNumberToUndefined,
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const n = typeof v === "number" ? v : parseInt(String(v), 10);
      return Number.isNaN(n) ? undefined : n;
    })
    .pipe(
      z
        .number({ invalid_type_error: "Nombre invalide" })
        .int("Doit être un nombre entier")
        .min(0, "Doit être positif ou nul")
        .optional(),
    ),
);

const fuelLevelSchema = z.preprocess(
  emptyNumberToUndefined,
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const n = typeof v === "number" ? v : parseInt(String(v), 10);
      return Number.isNaN(n) ? undefined : n;
    })
    .pipe(
      z
        .number({ invalid_type_error: "Niveau invalide" })
        .int("Doit être un pourcentage entier")
        .min(0, "Le carburant doit être entre 0 et 100 %")
        .max(100, "Le carburant doit être entre 0 et 100 %")
        .optional(),
    ),
);

export const contractFormSchema = z
  .object({
    clientId: z.string().min(1, "Client requis"),
    vehicleId: z.string().min(1, "Véhicule requis"),
    startAt: createRequiredDateTimeSchema("Date de début"),
    expectedEndAt: createRequiredDateTimeSchema("Date de fin prévue"),
    dailyPrice: optionalDecimal,
    depositAmount: optionalDecimal,
    includedMileage: optionalInt,
    extraMileagePrice: optionalDecimal,
    startMileage: optionalInt,
    expectedReturnMileage: optionalInt,
    startFuelLevel: fuelLevelSchema,
    terms: z
      .string()
      .trim()
      .max(5000, "Les clauses ne peuvent pas dépasser 5000 caractères")
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .superRefine((data, ctx) => {
    if (data.startAt >= data.expectedEndAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fin prévue doit être postérieure au début",
        path: ["expectedEndAt"],
      });
    }
    if (
      data.startMileage != null &&
      data.expectedReturnMileage != null &&
      data.expectedReturnMileage < data.startMileage
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Le kilométrage prévu au retour doit être supérieur ou égal au départ",
        path: ["expectedReturnMileage"],
      });
    }
  });

export type ContractFormInput = z.input<typeof contractFormSchema>;
export type ContractFormOutput = z.infer<typeof contractFormSchema>;

export const contractSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().optional(),
  status: z.nativeEnum(RentalContractStatus).optional(),
  clientId: z.string().optional(),
  vehicleId: z.string().optional(),
  dateFrom: z.string().optional().transform(optionalDateString),
  dateTo: z.string().optional().transform(optionalDateString),
});

export type ContractSearchInput = z.infer<typeof contractSearchSchema>;

export const completeContractSchema = z
  .object({
    actualEndAt: z.string().min(1).transform(optionalDateString),
    endMileage: optionalInt,
    endFuelLevel: fuelLevelSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.actualEndAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date de retour requise",
        path: ["actualEndAt"],
      });
    }
  });

export type CompleteContractInput = z.infer<typeof completeContractSchema>;
