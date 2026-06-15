import type { Prisma } from "@prisma/client";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import type {
  ReservationFormOutput,
  ReservationSearchInput,
} from "@/lib/validations/reservation";

function buildSearchWhere(
  companyId: string,
  params: ReservationSearchInput,
): Prisma.ReservationWhereInput {
  const { q } = params;

  const where: Prisma.ReservationWhereInput = {
    companyId,
    status: ReservationStatus.ACTIVE,
  };

  if (q) {
    where.OR = [
      { guestName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { snapchat: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      {
        bookedBy: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
          ],
        },
      },
      {
        vehicle: {
          OR: [
            { licensePlate: { contains: q, mode: "insensitive" } },
            { make: { contains: q, mode: "insensitive" } },
            { model: { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  return where;
}

const reservationSelect = {
  id: true,
  guestName: true,
  phone: true,
  snapchat: true,
  depositAmount: true,
  status: true,
  notes: true,
  createdAt: true,
  bookedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      licensePlate: true,
      make: true,
      model: true,
    },
  },
} satisfies Prisma.ReservationSelect;

export type ActiveReservationItem = Prisma.ReservationGetPayload<{
  select: typeof reservationSelect;
}>;

export async function listAllActiveReservations(
  companyId: string,
  q?: string,
) {
  const where = buildSearchWhere(companyId, { page: 1, pageSize: 1, q });

  return prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: reservationSelect,
  });
}

export async function listReservations(
  companyId: string,
  params: ReservationSearchInput,
) {
  const where = buildSearchWhere(companyId, params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.pageSize,
      select: reservationSelect,
    }),
    prisma.reservation.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function getReservationById(companyId: string, id: string) {
  const reservation = await prisma.reservation.findFirst({
    where: { id, companyId },
    select: reservationSelect,
  });

  if (!reservation) {
    throw new NotFoundError("Réservation introuvable");
  }

  return reservation;
}

export async function createReservation(
  companyId: string,
  bookedById: string,
  data: ReservationFormOutput,
) {
  if (data.vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, companyId, isActive: true },
      select: { id: true },
    });
    if (!vehicle) {
      throw new NotFoundError("Véhicule introuvable");
    }
  }

  return prisma.reservation.create({
    data: {
      companyId,
      bookedById,
      guestName: data.guestName,
      phone: data.phone,
      snapchat: data.snapchat,
      depositAmount: data.depositAmount,
      status: ReservationStatus.ACTIVE,
      vehicleId: data.vehicleId,
      notes: data.notes,
    },
    select: { id: true },
  });
}

export async function deleteReservation(companyId: string, id: string) {
  const existing = await prisma.reservation.findFirst({
    where: { id, companyId },
    select: { id: true },
  });

  if (!existing) {
    throw new NotFoundError("Réservation introuvable");
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CANCELLED },
  });
}

export async function listVehiclesForReservationForm(companyId: string) {
  return prisma.vehicle.findMany({
    where: { companyId, isActive: true },
    orderBy: [{ licensePlate: "asc" }],
    select: {
      id: true,
      licensePlate: true,
      make: true,
      model: true,
    },
  });
}
