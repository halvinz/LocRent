import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, createSessionToken, hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { LoginInput, RegisterCompanyInput } from "@/lib/validations/auth";
import type { SessionUser } from "@/types/auth";
import { ConflictError, UnauthorizedError } from "@/lib/errors";

async function generateUniqueCompanySlug(name: string): Promise<string> {
  const base = slugify(name) || "agence";
  let candidate = base;
  let suffix = 0;

  while (true) {
    const existing = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function registerCompanyAdmin(
  input: RegisterCompanyInput,
): Promise<SessionUser> {
  const email = input.email.toLowerCase().trim();

  const existingUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ConflictError("Cet email est déjà utilisé");
  }

  const slug = await generateUniqueCompanySlug(input.companyName);
  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.companyName.trim(),
        slug,
        email,
      },
    });

    return tx.user.create({
      data: {
        companyId: company.id,
        email,
        passwordHash,
        firstName: "Admin",
        lastName: input.companyName.trim().slice(0, 80),
        role: UserRole.ADMIN,
        permissions: [],
      },
    });
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
