import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InspectionType, StaffPermission } from "@prisma/client";
import { guardAnyPermission } from "@/lib/tenant/page-guard";
import { getContractById, getInspectionByType } from "@/server/services/contract.service";
import type { InspectionChecklist } from "@/config/inspection";
import { PageHeader } from "@/components/shared/page-header";
import { InspectionForm } from "@/components/inspections/inspection-form";

interface CheckoutPageProps {
  params: { id: string };
}

export const metadata: Metadata = { title: "État des lieux — départ" };

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { companyId } = await guardAnyPermission(
    StaffPermission.INSPECTIONS,
    StaffPermission.CONTRACTS,
  );

  let contract;
  try {
    contract = await getContractById(companyId, params.id);
  } catch {
    notFound();
  }

  const existing = getInspectionByType(contract, InspectionType.CHECKOUT);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="État des lieux — départ"
        description={`Contrat ${contract.contractNumber} — ${contract.vehicle.licensePlate}`}
      />
      <InspectionForm
        contractId={contract.id}
        type={InspectionType.CHECKOUT}
        defaultValues={{
          mileage: existing?.mileage ?? contract.startMileage ?? contract.vehicle.currentMileage ?? "",
          fuelLevel: existing?.fuelLevel ?? contract.startFuelLevel ?? "",
          notes: existing?.notes ?? "",
          damageSummary: existing?.damageSummary ?? "",
          checklist: (existing?.checklist as InspectionChecklist) ?? {},
          photos: existing?.photos.length
            ? existing.photos.map((p) => ({ url: p.url, caption: p.caption ?? "" }))
            : [],
        }}
      />
    </div>
  );
}
