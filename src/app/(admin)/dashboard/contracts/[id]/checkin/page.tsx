import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { InspectionType, RentalContractStatus } from "@prisma/client";
import { requireAuth } from "@/lib/tenant";
import { getContractById, getInspectionByType } from "@/server/services/contract.service";
import type { InspectionChecklist } from "@/config/inspection";
import { PageHeader } from "@/components/shared/page-header";
import { InspectionForm } from "@/components/inspections/inspection-form";

interface CheckinPageProps {
  params: { id: string };
}

export const metadata: Metadata = { title: "État des lieux — retour" };

export default async function CheckinPage({ params }: CheckinPageProps) {
  const { companyId } = await requireAuth();

  let contract;
  try {
    contract = await getContractById(companyId, params.id);
  } catch {
    notFound();
  }

  if (contract.status !== RentalContractStatus.ACTIVE) {
    redirect(`/dashboard/contracts/${contract.id}`);
  }

  const existing = getInspectionByType(contract, InspectionType.CHECKIN);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="État des lieux — retour"
        description={`Contrat ${contract.contractNumber} — ${contract.vehicle.licensePlate}`}
      />
      <InspectionForm
        contractId={contract.id}
        type={InspectionType.CHECKIN}
        defaultValues={{
          mileage: existing?.mileage ?? contract.endMileage ?? "",
          fuelLevel: existing?.fuelLevel ?? contract.endFuelLevel ?? "",
          notes: existing?.notes ?? "",
          damageSummary: existing?.damageSummary ?? "",
          checklist: (existing?.checklist as InspectionChecklist) ?? {},
          photos: existing?.photos.length
            ? existing.photos.map((p) => ({ url: p.url, caption: p.caption ?? "" }))
            : [{ url: "", caption: "" }],
        }}
      />
    </div>
  );
}
