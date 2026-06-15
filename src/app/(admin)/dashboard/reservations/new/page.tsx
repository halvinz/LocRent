import type { Metadata } from "next";
import { StaffPermission } from "@prisma/client";
import { guardPermission } from "@/lib/tenant/page-guard";
import { listVehiclesForReservationForm } from "@/server/services/reservation.service";
import { ReservationForm } from "@/components/reservations/reservation-form";
import { ReservationsBackLink } from "@/components/admin/reservations-back-link";

export const metadata: Metadata = { title: "Nouvelle réservation" };

export default async function NewReservationPage() {
  const { companyId } = await guardPermission(StaffPermission.RESERVATIONS);
  const vehicles = await listVehiclesForReservationForm(companyId);

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-4 sm:space-y-6">
      <ReservationsBackLink variant="inline" />

      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Nouvelle réservation
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enregistrez une réservation avec l&apos;acompte versé
        </p>
      </div>
      <ReservationForm vehicles={vehicles} />
    </div>
  );
}
