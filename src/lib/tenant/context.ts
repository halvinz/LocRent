import { UserRole } from "@prisma/client";
import type { TenantContext } from "@/types/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getSession } from "@/lib/auth/session";

export async function requireAuth(): Promise<TenantContext> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError();
  }

  return {
    companyId: session.user.companyId,
    userId: session.user.id,
    role: session.user.role,
  };
}

export async function requireAdmin(): Promise<TenantContext> {
  const ctx = await requireAuth();

  if (ctx.role !== UserRole.ADMIN) {
    throw new ForbiddenError("Action réservée aux administrateurs");
  }

  return ctx;
}

/** Prisma where clause helper — always scope queries to tenant */
export function tenantWhere(companyId: string) {
  return { companyId };
}
