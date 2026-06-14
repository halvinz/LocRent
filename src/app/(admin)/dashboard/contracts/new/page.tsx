import type { Metadata } from "next";
import { requireAuth } from "@/lib/tenant";
import { getContractFormOptions } from "@/server/services/contract.service";
import { PageHeader } from "@/components/shared/page-header";
import { ContractForm } from "@/components/contracts/contract-form";

export const metadata: Metadata = { title: "Nouveau contrat" };

export default async function NewContractPage() {
  const { companyId } = await requireAuth();
  const { clients, vehicles } = await getContractFormOptions(companyId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Nouveau contrat"
        description="Créer un brouillon de contrat de location"
      />
      <ContractForm mode="create" clients={clients} vehicles={vehicles} />
    </div>
  );
}
