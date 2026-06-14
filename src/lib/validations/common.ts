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

/** Parse datetime-local, ISO, or dd/MM/yyyy HH:mm strings. */
export function parseDateTimeString(value: string | undefined): Date | undefined {
  if (!value || value.trim() === "") return undefined;

  const trimmed = value.trim();
  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) return iso;

  const frMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/,
  );
  if (frMatch) {
    const [, day, month, year, hour = "0", minute = "0"] = frMatch;
    const d = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );
    if (!Number.isNaN(d.getTime())) return d;
  }

  return undefined;
}

export function createRequiredDateTimeSchema(label: string) {
  return z.union([z.string(), z.date()]).transform((value, ctx) => {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} invalide`,
        });
        return z.NEVER;
      }
      return value;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} requise`,
      });
      return z.NEVER;
    }

    const date = parseDateTimeString(trimmed);
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
