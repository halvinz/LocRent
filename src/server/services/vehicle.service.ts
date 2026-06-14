import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { VehicleFormOutput, VehicleSearchInput } from "@/lib/validations/vehicle";

function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/\s+/g, "").trim();
}

function buildSearchWhere(
  companyId: string,
  params: VehicleSearchInput,
): Prisma.VehicleWhereInput {
  const { q, status, includeInactive } = params;

  const where: Prisma.VehicleWhereInput = {
    companyId,
    ...(includeInactive ? {} : { isActive: true }),
    ...(status ? { status } : {}),
  };

  if (q) {
    where.OR = [
      { licensePlate: { contains: q, mode: "insensitive" } },
      { make: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { vin: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listVehicles(
  companyId: string,
  params: VehicleSearchInput,
) {
  const where = buildSearchWhere(companyId, params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: [{ licensePlate: "asc" }],
      skip,
      take: params.pageSize,
      select: {
        id: true,
        licensePlate: true,
        make: true,
        model: true,
        year: true,
        status: true,
        currentMileage: true,
        isActive: true,
        createdAt: true,
        _count: { select: { rentalContracts: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function getVehicleById(companyId: string, id: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, companyId },
    include: {
      _count: { select: { rentalContracts: true } },
      rentalContracts: {
        orderBy: { startAt: "desc" },
        take: 10,
        select: {
          id: true,
          contractNumber: true,
          status: true,
          startAt: true,
          expectedEndAt: true,
          client: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundError("Véhicule introuvable");
  }

  return vehicle;
}

export async function createVehicle(companyId: string, data: VehicleFormOutput) {
  const licensePlate = normalizePlate(data.licensePlate);

  const existing = await prisma.vehicle.findUnique({
    where: { companyId_licensePlate: { companyId, licensePlate } },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError("Un véhicule avec cette plaque existe déjà");
  }

  return prisma.vehicle.create({
    data: { ...data, licensePlate, companyId },
  });
}

export async function updateVehicle(
  companyId: string,
  id: string,
  data: VehicleFormOutput,
) {
  await assertVehicleExists(companyId, id);

  const licensePlate = normalizePlate(data.licensePlate);

  const duplicate = await prisma.vehicle.findFirst({
    where: {
      companyId,
      licensePlate,
      NOT: { id },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ConflictError("Un véhicule avec cette plaque existe déjà");
  }

  return prisma.vehicle.update({
    where: { id },
    data: { ...data, licensePlate },
  });
}

export async function softDeleteVehicle(companyId: string, id: string) {
  await assertVehicleExists(companyId, id);

  return prisma.vehicle.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function restoreVehicle(companyId: string, id: string) {
  await assertVehicleExists(companyId, id);

  return prisma.vehicle.update({
    where: { id },
    data: { isActive: true },
  });
}

async function assertVehicleExists(companyId: string, id: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, companyId },
    select: { id: true },
  });

  if (!vehicle) {
    throw new NotFoundError("Véhicule introuvable");
  }
}
