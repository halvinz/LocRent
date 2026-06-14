import { VehicleStatus } from "@prisma/client";
import { z } from "zod";
import { FUEL_TYPES, TRANSMISSION_TYPES } from "@/config/constants";
import { optionalDateString } from "./common";

export const vehicleFormSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .min(1, "La plaque est requise")
    .max(20)
    .transform((v) => v.toUpperCase().replace(/\s+/g, "")),
  make: z.string().trim().min(1, "La marque est requise").max(100),
  model: z.string().trim().min(1, "Le modèle est requis").max(100),
  trim: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  year: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      const n = typeof v === "number" ? v : parseInt(v, 10);
      return Number.isNaN(n) ? undefined : n;
    })
    .pipe(
      z
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
    ),
  vin: z
    .string()
    .trim()
    .max(17)
    .optional()
    .transform((v) => (v === "" ? undefined : v?.toUpperCase())),
  currentMileage: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      const n = typeof v === "number" ? v : parseInt(v, 10);
      return Number.isNaN(n) ? undefined : n;
    })
    .pipe(z.number().int().min(0).optional()),
  fuelType: z
    .enum(FUEL_TYPES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  transmission: z
    .enum(TRANSMISSION_TYPES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  color: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
  registrationExpiry: z
    .string()
    .optional()
    .transform(optionalDateString),
  insuranceExpiry: z
    .string()
    .optional()
    .transform(optionalDateString),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type VehicleFormInput = z.input<typeof vehicleFormSchema>;
export type VehicleFormOutput = z.infer<typeof vehicleFormSchema>;

export const vehicleSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
});

export type VehicleSearchInput = z.infer<typeof vehicleSearchSchema>;
