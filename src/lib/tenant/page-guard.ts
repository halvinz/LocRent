import { redirect } from "next/navigation";
import { StaffPermission } from "@prisma/client";
import { AUTH_ROUTES } from "@/lib/auth";
import {
  requireAdmin,
  requireAnyPermission,
  requirePermission,
} from "@/lib/tenant";

export async function guardAdmin() {
  try {
    return await requireAdmin();
  } catch {
    redirect(AUTH_ROUTES.dashboard);
  }
}

export async function guardPermission(permission: StaffPermission) {
  try {
    return await requirePermission(permission);
  } catch {
    redirect(AUTH_ROUTES.dashboard);
  }
}

export async function guardAnyPermission(...permissions: StaffPermission[]) {
  try {
    return await requireAnyPermission(...permissions);
  } catch {
    redirect(AUTH_ROUTES.dashboard);
  }
}
