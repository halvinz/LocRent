import { StaffPermission, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/user";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  permissions: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export async function listCompanyUsers(companyId: string) {
  return prisma.user.findMany({
    where: { companyId },
    orderBy: [{ role: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    select: userSelect,
  });
}

export async function createStaffUser(companyId: string, data: CreateStaffInput) {
  const existing = await prisma.user.findFirst({
    where: { companyId, email: data.email.toLowerCase() },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError("Un utilisateur avec cet email existe déjà");
  }

  const passwordHash = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      companyId,
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.STAFF,
      permissions: data.permissions,
    },
    select: userSelect,
  });
}

export async function updateStaffUser(
  companyId: string,
  userId: string,
  data: UpdateStaffInput,
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, companyId },
    select: { id: true, role: true },
  });

  if (!user) throw new NotFoundError("Utilisateur introuvable");
  if (user.role === UserRole.ADMIN) {
    throw new ValidationError("Le compte administrateur ne peut pas être modifié ici");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      permissions: data.permissions,
      isActive: data.isActive,
    },
    select: userSelect,
  });
}

export async function deleteStaffUser(
  companyId: string,
  userId: string,
  requestedByUserId: string,
) {
  if (userId === requestedByUserId) {
    throw new ValidationError("Vous ne pouvez pas supprimer votre propre compte");
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, companyId },
    select: { id: true, role: true, firstName: true, lastName: true },
  });

  if (!user) throw new NotFoundError("Utilisateur introuvable");
  if (user.role === UserRole.ADMIN) {
    throw new ValidationError("Le compte administrateur ne peut pas être supprimé");
  }

  await prisma.user.delete({ where: { id: userId } });
}

export async function countActiveAdmins(companyId: string) {
  return prisma.user.count({
    where: { companyId, role: UserRole.ADMIN, isActive: true },
  });
}

export type CompanyUser = Awaited<ReturnType<typeof listCompanyUsers>>[number];
