"use server";

import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { loginSchema } from "@/lib/validations/auth";
import { setSessionCookie, clearSessionCookie, AUTH_ROUTES } from "@/lib/auth";
import {
  authenticateUser,
  createSessionForUser,
} from "@/server/services/auth.service";
import { getErrorMessage, isAppError } from "@/lib/errors";
import type { ActionResult } from "@/types/auth";

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const parsed = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const user = await authenticateUser(parsed);
    const token = await createSessionForUser(user);
    await setSessionCookie(token);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
      }
      return { success: false, fieldErrors };
    }

    if (isAppError(error)) {
      return { success: false, error: error.message };
    }

    return { success: false, error: getErrorMessage(error) };
  }

  redirect(AUTH_ROUTES.dashboard);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect(AUTH_ROUTES.login);
}
