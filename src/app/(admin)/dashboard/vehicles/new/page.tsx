import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export const metadata: Metadata = { title: "Nouveau véhicule" };

export default function NewVehiclePage() {
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
