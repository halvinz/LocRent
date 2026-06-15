import { StaffPermission, UserRole } from "@prisma/client";
import type { TenantContext } from "@/types/auth";
import { ALL_STAFF_PERMISSIONS } from "@/config/permissions";

export function resolveUserPermissions(
  role: UserRole,
  permissions: StaffPermission[],
): StaffPermission[] {
  if (role === UserRole.ADMIN) return ALL_STAFF_PERMISSIONS;
  return permissions;
}

export function hasPermission(
  ctx: Pick<TenantContext, "role" | "permissions">,
  permission: StaffPermission,
): boolean {
  if (ctx.role === UserRole.ADMIN) return true;
  return ctx.permissions.includes(permission);
}

export function hasAnyPermission(
  ctx: Pick<TenantContext, "role" | "permissions">,
  permissions: StaffPermission[],
): boolean {
  if (ctx.role === UserRole.ADMIN) return true;
  return permissions.some((p) => ctx.permissions.includes(p));
}

export function canAccessPath(
  ctx: Pick<TenantContext, "role" | "permissions">,
  pathname: string,
  routePermissions: Record<string, StaffPermission | StaffPermission[]>,
): boolean {
  if (pathname.startsWith("/dashboard/settings")) {
    return ctx.role === UserRole.ADMIN;
  }

  if (pathname === "/dashboard") return true;

  if (ctx.role === UserRole.ADMIN) return true;

  for (const [prefix, required] of Object.entries(routePermissions)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const perms = Array.isArray(required) ? required : [required];
      return hasAnyPermission(ctx, perms);
    }
  }

  return true;
}
