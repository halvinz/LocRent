import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RentalContractStatus } from "@prisma/client";
import { requireAuth } from "@/lib/tenant";
import {
  getContractById,
  getContractFormOptions,
} from "@/server/services/contract.service";
import { PageHeader } from "@/components/shared/page-header";
import {
  ContractForm,
  toDatetimeLocalValue,
} from "@/components/contracts/contract-form";

interface EditContractPageProps {
  params: { id: string };
}

export const metadata: Metadata = { title: "Modifier le contrat" };

export default async function EditContractPage({ params }: EditContractPageProps) {
  const { companyId } = await requireAuth();

  let contract;
  try {
    contract = await getContractById(companyId, params.id);
  } catch {
    notFound();
  }

  if (contract.status !== RentalContractStatus.DRAFT) {
    redirect(`/dashboard/contracts/${contract.id}`);
  }

  const { clients, vehicles } = await getContractFormOptions(companyId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={`Modifier ${contract.contractNumber}`}
        description="Brouillon — modification autorisée"
      />
      <ContractForm
        mode="edit"
        contractId={contract.id}
        clients={clients}
        vehicles={vehicles}
        defaultValues={{
          clientId: contract.clientId,
          vehicleId: contract.vehicleId,
          startAt: toDatetimeLocalValue(contract.startAt),
          expectedEndAt: toDatetimeLocalValue(contract.expectedEndAt),
          dailyPrice: contract.dailyPrice?.toString() ?? "",
          depositAmount: contract.depositAmount?.toString() ?? "",
          includedMileage: contract.includedMileage ?? "",
          extraMileagePrice: contract.extraMileagePrice?.toString() ?? "",
          startMileage: contract.startMileage ?? "",
          expectedReturnMileage: contract.expectedReturnMileage ?? "",
          startFuelLevel: contract.startFuelLevel ?? "",
          terms: contract.terms ?? "",
        }}
      />
    </div>
  );
}
