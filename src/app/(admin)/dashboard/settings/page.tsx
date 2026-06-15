import type { Metadata } from "next";
import { guardAdmin } from "@/lib/tenant/page-guard";
import { listCompanyUsers } from "@/server/services/user.service";
import { TeamManagement } from "@/components/settings/team-management";

export const metadata: Metadata = { title: "Paramètres — Équipe" };

export default async function SettingsPage() {
  const { companyId } = await guardAdmin();
  const users = await listCompanyUsers(companyId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">
          Gérez votre équipe et les droits d&apos;accès de chaque employé
        </p>
      </div>
      <TeamManagement users={users} />
    </div>
  );
}
