import type { Metadata } from "next";
import { StaffPermission } from "@prisma/client";
import { guardPermission } from "@/lib/tenant/page-guard";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/clients/client-form";

export const metadata: Metadata = { title: "Nouveau client" };

export default async function NewClientPage() {
  await guardPermission(StaffPermission.CLIENTS);
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
