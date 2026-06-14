"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/tenant";
import {
  fineFormSchema,
  fineMatchSchema,
  linkFineSchema,
  updateFineStatusSchema,
} from "@/lib/validations/fine";
import { toActionResult, toActionSuccess } from "@/lib/actions/utils";
import {
  createFine,
  linkFineToContract,
  matchFinePreview,
  updateFineStatus,
} from "@/server/services/fine.service";
import type { ActionResult } from "@/types/auth";
import type { FineMatchResult } from "@/server/services/fine-matching.service";

const BASE = "/dashboard/fines";

export async function matchRenterAction(
  input: unknown,
): Promise<ActionResult<FineMatchResult>> {
  try {
    const { companyId } = await requireAuth();
    const data = fineMatchSchema.parse(input);
    const result = await matchFinePreview(
      companyId,
      data.licensePlate,
      data.violationAt,
    );
    return toActionSuccess(result);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createFineAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    const data = fineFormSchema.parse(input);
    const fine = await createFine(companyId, data);
    revalidatePath(BASE);
    revalidatePath("/dashboard");
    return toActionSuccess({ id: fine.id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function linkFineAction(
  fineId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    const data = linkFineSchema.parse(input);
    await linkFineToContract(
      companyId,
      fineId,
      data.rentalContractId,
      data.vehicleId,
    );
    revalidatePath(BASE);
    revalidatePath(`${BASE}/${fineId}`);
    revalidatePath("/dashboard");
    return toActionSuccess({ id: fineId });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function updateFineStatusAction(
  fineId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    const { status } = updateFineStatusSchema.parse(input);
    await updateFineStatus(companyId, fineId, status);
    revalidatePath(BASE);
    revalidatePath(`${BASE}/${fineId}`);
    revalidatePath("/dashboard");
    return toActionSuccess({ id: fineId });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createFineAndRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await createFineAction(input);
  if (result.success && result.data) {
    redirect(`${BASE}/${result.data.id}`);
  }
  return result;
}
