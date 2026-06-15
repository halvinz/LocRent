import { StaffPermission, UserRole } from "@prisma/client";
import type { TenantContext } from "@/types/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { resolveUserPermissions } from "@/lib/permissions";

export async function requireAuth(): Promise<TenantContext> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      companyId: session.user.companyId,
      isActive: true,
    },
    select: { role: true, permissions: true },
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  return {
    companyId: session.user.companyId,
    userId: session.user.id,
    role: user.role,
    permissions: resolveUserPermissions(user.role, user.permissions),
  };
}

export async function requireAdmin(): Promise<TenantContext> {
  const ctx = await requireAuth();

  if (ctx.role !== UserRole.ADMIN) {
    throw new ForbiddenError("Action réservée aux administrateurs");
  }

  return ctx;
}

export async function requirePermission(
  permission: StaffPermission,
): Promise<TenantContext> {
  const ctx = await requireAuth();

  if (ctx.role === UserRole.ADMIN || ctx.permissions.includes(permission)) {
    return ctx;
  }

  throw new ForbiddenError("Vous n'avez pas les droits pour cette action");
}

export async function requireAnyPermission(
  ...permissions: StaffPermission[]
): Promise<TenantContext> {
  const ctx = await requireAuth();

  if (
    ctx.role === UserRole.ADMIN ||
    permissions.some((p) => ctx.permissions.includes(p))
  ) {
    return ctx;
  }

  throw new ForbiddenError("Vous n'avez pas les droits pour cette action");
}

/** Prisma where clause helper — always scope queries to tenant */
export function tenantWhere(companyId: string) {
  return { companyId };
}
