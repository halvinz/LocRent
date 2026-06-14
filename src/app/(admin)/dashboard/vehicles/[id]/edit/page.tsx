import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/tenant";
import { formatDateForInput } from "@/lib/utils";
import { getVehicleById } from "@/server/services/vehicle.service";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

interface EditVehiclePageProps {
  params: { id: string };
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Modifier le véhicule" };
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { companyId } = await requireAuth();

  let vehicle;
  try {
    vehicle = await getVehicleById(companyId, params.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={`Modifier ${vehicle.licensePlate}`}
        description="Mettre à jour les informations du véhicule"
      />
      <VehicleForm
        mode="edit"
        vehicleId={vehicle.id}
        defaultValues={{
          licensePlate: vehicle.licensePlate,
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim ?? "",
          year: vehicle.year ?? "",
          vin: vehicle.vin ?? "",
          currentMileage: vehicle.currentMileage ?? "",
          fuelType: vehicle.fuelType ?? "",
          transmission: vehicle.transmission ?? "",
          color: vehicle.color ?? "",
          status: vehicle.status,
          registrationExpiry: formatDateForInput(vehicle.registrationExpiry),
          insuranceExpiry: formatDateForInput(vehicle.insuranceExpiry),
          notes: vehicle.notes ?? "",
        }}
      />
    </div>
  );
}
