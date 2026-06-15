import type { Metadata } from "next";
import { StaffPermission } from "@prisma/client";
import { guardPermission } from "@/lib/tenant/page-guard";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export const metadata: Metadata = { title: "Nouveau véhicule" };

export default async function NewVehiclePage() {
  await guardPermission(StaffPermission.VEHICLES);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Nouveau véhicule"
        description="Ajouter un véhicule au parc"
      />
      <VehicleForm mode="create" />
    </div>
  );
}
