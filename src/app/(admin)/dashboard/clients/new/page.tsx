import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/clients/client-form";

export const metadata: Metadata = { title: "Nouveau client" };

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Nouveau client"
        description="Ajouter un client locataire"
      />
      <ClientForm mode="create" />
    </div>
  );
}
