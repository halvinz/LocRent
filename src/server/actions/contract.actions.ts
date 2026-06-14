"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/tenant";
import { contractFormSchema, completeContractSchema } from "@/lib/validations/contract";
import { toActionResult, toActionSuccess } from "@/lib/actions/utils";
import {
  activateContract,
  cancelContract,
  completeContract,
  createContract,
  updateContract,
} from "@/server/services/contract.service";
import type { ActionResult } from "@/types/auth";

const BASE = "/dashboard/contracts";

export async function createContractAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    const data = contractFormSchema.parse(input);
    const contract = await createContract(companyId, data);
    revalidatePath(BASE);
    return toActionSuccess({ id: contract.id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function updateContractAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    const data = contractFormSchema.parse(input);
    await updateContract(companyId, id, data);
    revalidatePath(BASE);
    revalidatePath(`${BASE}/${id}`);
    return toActionSuccess({ id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function activateContractAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    await activateContract(companyId, id);
    revalidatePath(BASE);
    revalidatePath(`${BASE}/${id}`);
    return toActionSuccess({ id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function completeContractAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    const data = completeContractSchema.parse(input);
    await completeContract(companyId, id, data);
    revalidatePath(BASE);
    revalidatePath(`${BASE}/${id}`);
    return toActionSuccess({ id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function cancelContractAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAuth();
    await cancelContract(companyId, id);
    revalidatePath(BASE);
    revalidatePath(`${BASE}/${id}`);
    return toActionSuccess({ id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createContractAndRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await createContractAction(input);
  if (result.success && result.data) {
    redirect(`${BASE}/${result.data.id}`);
  }
  return result;
}

export async function updateContractAndRedirectAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await updateContractAction(id, input);
  if (result.success) {
    redirect(`${BASE}/${id}`);
  }
  return result;
}
