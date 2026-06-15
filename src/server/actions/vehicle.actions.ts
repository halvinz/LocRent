"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StaffPermission } from "@prisma/client";
import { requirePermission } from "@/lib/tenant";
import { vehicleFormSchema } from "@/lib/validations/vehicle";
import { toActionResult, toActionSuccess } from "@/lib/actions/utils";
import {
  createVehicle,
  softDeleteVehicle,
  restoreVehicle,
  updateVehicle,
} from "@/server/services/vehicle.service";
import type { ActionResult } from "@/types/auth";

const VEHICLES_PATH = "/dashboard/vehicles";

export async function createVehicleAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requirePermission(StaffPermission.VEHICLES);
    const data = vehicleFormSchema.parse(input);
    const vehicle = await createVehicle(companyId, data);
    revalidatePath(VEHICLES_PATH);
    return toActionSuccess({ id: vehicle.id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function updateVehicleAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requirePermission(StaffPermission.VEHICLES);
    const data = vehicleFormSchema.parse(input);
    await updateVehicle(companyId, id, data);
    revalidatePath(VEHICLES_PATH);
    revalidatePath(`${VEHICLES_PATH}/${id}`);
    revalidatePath(`${VEHICLES_PATH}/${id}/edit`);
    return toActionSuccess({ id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function deleteVehicleAction(id: string): Promise<ActionResult> {
  try {
    const { companyId } = await requirePermission(StaffPermission.VEHICLES);
    await softDeleteVehicle(companyId, id);
    revalidatePath(VEHICLES_PATH);
    revalidatePath(`${VEHICLES_PATH}/${id}`);
    return toActionSuccess(undefined);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function restoreVehicleAction(id: string): Promise<ActionResult> {
  try {
    const { companyId } = await requirePermission(StaffPermission.VEHICLES);
    await restoreVehicle(companyId, id);
    revalidatePath(VEHICLES_PATH);
    revalidatePath(`${VEHICLES_PATH}/${id}`);
    return toActionSuccess(undefined);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createVehicleAndRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await createVehicleAction(input);
  if (result.success && result.data) {
    redirect(`${VEHICLES_PATH}/${result.data.id}`);
  }
  return result;
}

export async function updateVehicleAndRedirectAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await updateVehicleAction(id, input);
  if (result.success) {
    redirect(`${VEHICLES_PATH}/${id}`);
  }
  return result;
}
