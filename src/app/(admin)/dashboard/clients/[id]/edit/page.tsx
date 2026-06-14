import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/tenant";
import { formatDateForInput } from "@/lib/utils";
import { getClientById } from "@/server/services/client.service";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/clients/client-form";

interface EditClientPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: EditClientPageProps): Promise<Metadata> {
  return { title: "Modifier le client" };
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { companyId } = await requireAuth();

  let client;
  try {
    client = await getClientById(companyId, params.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={`Modifier ${client.firstName} ${client.lastName}`}
        description="Mettre à jour les informations du client"
      />
      <ClientForm
        mode="edit"
        clientId={client.id}
        defaultValues={{
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: client.address ?? "",
          drivingLicenseNumber: client.drivingLicenseNumber ?? "",
          drivingLicenseIssuedAt: formatDateForInput(client.drivingLicenseIssuedAt),
          drivingLicenseExpiryAt: formatDateForInput(client.drivingLicenseExpiryAt),
          drivingLicenseFrontUrl: client.drivingLicenseFrontUrl ?? "",
          drivingLicenseBackUrl: client.drivingLicenseBackUrl ?? "",
          notes: client.notes ?? "",
        }}
      />
    </div>
  );
}
