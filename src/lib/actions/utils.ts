import { ZodError } from "zod";
import type { ActionResult } from "@/types/auth";
import {
  getErrorMessage,
  isAppError,
  ValidationError,
} from "@/lib/errors";

export function toActionResult<T = void>(error: unknown): ActionResult<T> {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "form";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return { success: false, fieldErrors };
  }

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  if (isAppError(error)) {
    return { success: false, error: error.message };
  }

  return { success: false, error: getErrorMessage(error) };
}

export function toActionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}
