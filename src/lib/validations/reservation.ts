import { z } from "zod";
import { paginationSchema } from "./common";

export const reservationFormSchema = z
  .object({
    guestName: z
      .string()
      .trim()
      .min(1, "Le nom du client est requis")
      .max(200),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    snapchat: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    depositAmount: z.coerce
      .number({ invalid_type_error: "Montant invalide" })
      .min(0, "L'acompte doit être positif ou nul"),
    vehicleId: z
      .string()
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    notes: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
  })
  .refine((data) => Boolean(data.phone || data.snapchat), {
    message: "Indiquez un numéro de téléphone ou un Snap",
    path: ["phone"],
  });

export const reservationSearchSchema = paginationSchema.extend({
  q: z.string().trim().optional(),
});

export type ReservationFormInput = z.input<typeof reservationFormSchema>;
export type ReservationFormOutput = z.output<typeof reservationFormSchema>;
export type ReservationSearchInput = z.infer<typeof reservationSearchSchema>;
