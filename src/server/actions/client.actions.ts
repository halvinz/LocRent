"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StaffPermission } from "@prisma/client";
import { requirePermission } from "@/lib/tenant";
import { clientFormSchema } from "@/lib/validations/client";
import { toActionResult, toActionSuccess } from "@/lib/actions/utils";
import {
  createClient,
  softDeleteClient,
  restoreClient,
  updateClient,
} from "@/server/services/client.service";
import type { ActionResult } from "@/types/auth";

const CLIENTS_PATH = "/dashboard/clients";

export async function createClientAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requirePermission(StaffPermission.CLIENTS);
    const data = clientFormSchema.parse(input);
    const client = await createClient(companyId, data);
    revalidatePath(CLIENTS_PATH);
    return toActionSuccess({ id: client.id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function updateClientAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requirePermission(StaffPermission.CLIENTS);
    const data = clientFormSchema.parse(input);
    await updateClient(companyId, id, data);
    revalidatePath(CLIENTS_PATH);
    revalidatePath(`${CLIENTS_PATH}/${id}`);
    revalidatePath(`${CLIENTS_PATH}/${id}/edit`);
    return toActionSuccess({ id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  try {
    const { companyId } = await requirePermission(StaffPermission.CLIENTS);
    await softDeleteClient(companyId, id);
    revalidatePath(CLIENTS_PATH);
    revalidatePath(`${CLIENTS_PATH}/${id}`);
    return toActionSuccess(undefined);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function restoreClientAction(id: string): Promise<ActionResult> {
  try {
    const { companyId } = await requirePermission(StaffPermission.CLIENTS);
    await restoreClient(companyId, id);
    revalidatePath(CLIENTS_PATH);
    revalidatePath(`${CLIENTS_PATH}/${id}`);
    return toActionSuccess(undefined);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createClientAndRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await createClientAction(input);
  if (result.success && result.data) {
    redirect(`${CLIENTS_PATH}/${result.data.id}`);
  }
  return result;
}

export async function updateClientAndRedirectAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await updateClientAction(id, input);
  if (result.success) {
    redirect(`${CLIENTS_PATH}/${id}`);
  }
  return result;
}
