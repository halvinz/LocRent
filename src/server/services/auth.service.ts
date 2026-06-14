import { prisma } from "@/lib/db/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth";
import type { LoginInput } from "@/lib/validations/auth";
import type { SessionUser } from "@/types/auth";
import { UnauthorizedError } from "@/lib/errors";

export async function authenticateUser(input: LoginInput): Promise<SessionUser> {
  const user = await prisma.user.findFirst({
    where: {
      email: input.email,
      isActive: true,
      company: { isActive: true },
    },
    include: {
      company: { select: { id: true, isActive: true } },
    },
  });

  if (!user) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);

  if (!valid) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

export async function createSessionForUser(
  user: SessionUser,
): Promise<string> {
  return createSessionToken(user);
}

export async function getUserWithCompany(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      company: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}
