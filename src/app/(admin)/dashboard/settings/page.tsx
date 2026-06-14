import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/tenant";
import { AUTH_ROUTES } from "@/lib/auth";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const { role } = await requireAuth();

  if (role !== UserRole.ADMIN) {
    redirect(AUTH_ROUTES.dashboard);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">
          Configuration de la société — réservé aux administrateurs
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>En construction</CardTitle>
          <CardDescription>
            Gestion du profil société et des utilisateurs.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
