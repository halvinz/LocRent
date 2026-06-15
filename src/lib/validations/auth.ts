import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide")
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Inscription loueur : 1 agence = 1 company = 1 admin */
export const registerCompanySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Nom d'agence requis (min. 2 caractères)")
    .max(120, "Nom d'agence trop long"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
