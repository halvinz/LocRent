import { z } from "zod";
import { StaffPermission } from "@prisma/client";

export const staffPermissionsSchema = z
  .array(z.nativeEnum(StaffPermission))
  .default([]);

export const createStaffSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(100),
  lastName: z.string().trim().min(1, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  permissions: staffPermissionsSchema,
});

export const updateStaffSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(100),
  lastName: z.string().trim().min(1, "Nom requis").max(100),
  permissions: staffPermissionsSchema,
  isActive: z.boolean(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
