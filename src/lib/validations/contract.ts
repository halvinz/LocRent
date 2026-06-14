import { RentalContractStatus } from "@prisma/client";
import { z } from "zod";
import { optionalDateString } from "./common";

const optionalDecimal = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = typeof v === "number" ? v : parseFloat(v.replace(",", "."));
    return Number.isNaN(n) ? undefined : n;
  })
  .pipe(z.number().min(0).optional());

const optionalInt = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = typeof v === "number" ? v : parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  })
  .pipe(z.number().int().min(0).optional());

const fuelLevelSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = typeof v === "number" ? v : parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  })
  .pipe(z.number().int().min(0).max(100).optional());

export const contractFormSchema = z
  .object({
    clientId: z.string().min(1, "Client requis"),
    vehicleId: z.string().min(1, "Véhicule requis"),
    startAt: z.string().min(1, "Date de début requise").transform(optionalDateString),
    expectedEndAt: z
      .string()
      .min(1, "Date de fin prévue requise")
      .transform(optionalDateString),
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
      .max(5000)
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .superRefine((data, ctx) => {
    if (!data.startAt || !data.expectedEndAt) return;
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
        message: "Le kilométrage prévu au retour doit être ≥ au départ",
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
