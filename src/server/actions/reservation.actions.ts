"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StaffPermission } from "@prisma/client";
import { requirePermission } from "@/lib/tenant";
import { reservationFormSchema } from "@/lib/validations/reservation";
import { toActionResult, toActionSuccess } from "@/lib/actions/utils";
import {
  createReservation,
  deleteReservation,
  listAllActiveReservations,
} from "@/server/services/reservation.service";
import type { ActionResult } from "@/types/auth";

const RESERVATIONS_PATH = "/dashboard/reservations";

export async function getActiveReservationsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listAllActiveReservations>>>
> {
  try {
    const { companyId } = await requirePermission(StaffPermission.RESERVATIONS);
    const items = await listAllActiveReservations(companyId);
    return toActionSuccess(items);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createReservationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requirePermission(
      StaffPermission.RESERVATIONS,
    );
    const data = reservationFormSchema.parse(input);
    const reservation = await createReservation(companyId, userId, data);
    revalidatePath(RESERVATIONS_PATH);
    return toActionSuccess({ id: reservation.id });
  } catch (error) {
    return toActionResult(error);
  }
}

export async function deleteReservationAction(id: string): Promise<ActionResult> {
  try {
    const { companyId } = await requirePermission(StaffPermission.RESERVATIONS);
    await deleteReservation(companyId, id);
    revalidatePath(RESERVATIONS_PATH);
    return toActionSuccess(undefined);
  } catch (error) {
    return toActionResult(error);
  }
}

export async function createReservationAndRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const result = await createReservationAction(input);
  if (result.success) {
    redirect(RESERVATIONS_PATH);
  }
  return result;
}
