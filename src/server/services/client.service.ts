import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import type { ClientFormOutput, ClientSearchInput } from "@/lib/validations/client";

function buildSearchWhere(
  companyId: string,
  params: ClientSearchInput,
): Prisma.ClientWhereInput {
  const { q, includeInactive } = params;

  const where: Prisma.ClientWhereInput = {
    companyId,
    ...(includeInactive ? {} : { isActive: true }),
  };

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { drivingLicenseNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listClients(companyId: string, params: ClientSearchInput) {
  const where = buildSearchWhere(companyId, params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip,
      take: params.pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        drivingLicenseNumber: true,
        isActive: true,
        createdAt: true,
        _count: { select: { rentalContracts: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function getClientById(companyId: string, id: string) {
  const client = await prisma.client.findFirst({
    where: { id, companyId },
    include: {
      _count: { select: { rentalContracts: true } },
      rentalContracts: {
        orderBy: { startAt: "desc" },
        take: 5,
        select: {
          id: true,
          contractNumber: true,
          status: true,
          startAt: true,
          expectedEndAt: true,
          vehicle: {
            select: { id: true, licensePlate: true, make: true, model: true },
          },
        },
      },
    },
  });

  if (!client) {
    throw new NotFoundError("Client introuvable");
  }

  return client;
}

export async function createClient(companyId: string, data: ClientFormOutput) {
  return prisma.client.create({
    data: { ...data, companyId },
  });
}

export async function updateClient(
  companyId: string,
  id: string,
  data: ClientFormOutput,
) {
  await assertClientExists(companyId, id);

  return prisma.client.update({
    where: { id },
    data,
  });
}

export async function softDeleteClient(companyId: string, id: string) {
  await assertClientExists(companyId, id);

  return prisma.client.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function restoreClient(companyId: string, id: string) {
  await assertClientExists(companyId, id);

  return prisma.client.update({
    where: { id },
    data: { isActive: true },
  });
}

async function assertClientExists(companyId: string, id: string) {
  const client = await prisma.client.findFirst({
    where: { id, companyId },
    select: { id: true },
  });

  if (!client) {
    throw new NotFoundError("Client introuvable");
  }
}
