import { z } from "zod";
import {
  optionalDateString,
  optionalEmailSchema,
  optionalUrlSchema,
} from "./common";

export const clientFormSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  email: optionalEmailSchema,
  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  drivingLicenseNumber: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  drivingLicenseIssuedAt: z
    .string()
    .optional()
    .transform(optionalDateString),
  drivingLicenseExpiryAt: z
    .string()
    .optional()
    .transform(optionalDateString),
  drivingLicenseFrontUrl: optionalUrlSchema,
  drivingLicenseBackUrl: optionalUrlSchema,
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type ClientFormInput = z.input<typeof clientFormSchema>;
export type ClientFormOutput = z.infer<typeof clientFormSchema>;

export const clientSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
});

export type ClientSearchInput = z.infer<typeof clientSearchSchema>;
