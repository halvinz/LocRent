"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InspectionType } from "@prisma/client";
import { requireAuth } from "@/lib/tenant";
import { inspectionFormSchema } from "@/lib/validations/inspection";
import { toActionResult, toActionSuccess } from "@/lib/actions/utils";
import { upsertInspection } from "@/server/services/inspection.service";
import type { ActionResult } from "@/types/auth";

const basePath = (id: string) => `/dashboard/contracts/${id}`;

export async function saveInspectionAction(
  contractId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireAuth();
    const data = inspectionFormSchema.parse(input);
    const inspection = await upsertInspection(
      companyId,
      contractId,
      userId,
      data,
    );

    revalidatePath(basePath(contractId));
    revalidatePath(`${basePath(contractId)}/checkout`);
    revalidatePath(`${basePath(contractId)}/checkin`);
    revalidatePath("/dashboard/inspections");

    if (!inspection) {
      return toActionResult(new Error("Erreur lors de l'enregistrement"));
    }

    return toActionSuccess({ id: inspection.id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function saveInspectionAndRedirectAction(
  contractId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await saveInspectionAction(contractId, input);
  if (result.success) {
    redirect(basePath(contractId));
  }
  return result;
}

export async function saveCheckoutAction(
  contractId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = inspectionFormSchema.safeParse({
    ...(typeof input === "object" && input !== null ? input : {}),
    type: InspectionType.CHECKOUT,
  });
  if (!parsed.success) return toActionResult(parsed.error);
  return saveInspectionAndRedirectAction(contractId, parsed.data);
}

export async function saveCheckinAction(
  contractId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = inspectionFormSchema.safeParse({
    ...(typeof input === "object" && input !== null ? input : {}),
    type: InspectionType.CHECKIN,
  });
  if (!parsed.success) return toActionResult(parsed.error);
  return saveInspectionAndRedirectAction(contractId, parsed.data);
}
