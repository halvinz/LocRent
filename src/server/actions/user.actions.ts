"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/tenant";
import { createStaffSchema, updateStaffSchema } from "@/lib/validations/user";
import { toActionResult, toActionSuccess } from "@/lib/actions/utils";
import {
  createStaffUser,
  deleteStaffUser,
  listCompanyUsers,
  updateStaffUser,
} from "@/server/services/user.service";
import type { ActionResult } from "@/types/auth";
import type { CompanyUser } from "@/server/services/user.service";

const SETTINGS_PATH = "/dashboard/settings";

export async function listCompanyUsersAction(): Promise<
  ActionResult<CompanyUser[]>
> {
  try {
    const { companyId } = await requireAdmin();
    const users = await listCompanyUsers(companyId);
    return toActionSuccess(users);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createStaffAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAdmin();
    const data = createStaffSchema.parse(input);
    const user = await createStaffUser(companyId, data);
    revalidatePath(SETTINGS_PATH);
    return toActionSuccess({ id: user.id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function updateStaffAction(
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId } = await requireAdmin();
    const data = updateStaffSchema.parse(input);
    await updateStaffUser(companyId, userId, data);
    revalidatePath(SETTINGS_PATH);
    return toActionSuccess({ id: userId });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function deleteStaffAction(
  userId: string,
): Promise<ActionResult> {
  try {
    const { companyId, userId: adminId } = await requireAdmin();
    await deleteStaffUser(companyId, userId, adminId);
    revalidatePath(SETTINGS_PATH);
    return toActionSuccess(undefined);
  } catch (error) {
    return toActionResult(error);
  }
}
