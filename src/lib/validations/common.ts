import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export function emptyToUndefined(value: string | undefined): string | undefined {
  if (!value || value.trim() === "") return undefined;
  return value.trim();
}

export function optionalDateString(value: string | undefined): Date | undefined {
  if (!value || value.trim() === "") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

/** Parse datetime-local / ISO strings; returns undefined if invalid. */
export function parseDateTimeString(value: string | undefined): Date | undefined {
  return optionalDateString(value);
}

export function createRequiredDateTimeSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} requise`)
    .transform((value, ctx) => {
      const date = parseDateTimeString(value);
      if (!date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} invalide`,
        });
        return z.NEVER;
      }
      return date;
    });
}

export const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform(emptyToUndefined)
  .pipe(
    z
      .string()
      .url("URL invalide")
      .optional()
      .or(z.undefined()),
  );

export const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform(emptyToUndefined)
  .pipe(
    z
      .string()
      .email("Email invalide")
      .optional()
      .or(z.undefined()),
  );
