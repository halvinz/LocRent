import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/tenant";
import { getDashboardFineStats } from "@/server/services/fine.service";
import { prisma } from "@/lib/db/prisma";
import { RentalContractStatus, VehicleStatus } from "@prisma/client";
import { FineStatusBadge } from "@/components/fines/fine-status-badge";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const { companyId } = await requireAuth();

  const [clientsCount, vehiclesCount, activeContracts, fineStats] =
    await Promise.all([
      prisma.client.count({ where: { companyId, isActive: true } }),
      prisma.vehicle.count({ where: { companyId } }),
      prisma.rentalContract.count({
        where: { companyId, status: RentalContractStatus.ACTIVE },
      }),
      getDashboardFineStats(companyId),
    ]);

  const availableVehicles = await prisma.vehicle.count({
    where: { companyId, status: VehicleStatus.AVAILABLE },
  });

  const stats: Array<{
    title: string;
    value: number;
    description: string;
    href?: Route;
  }> = [
    {
      title: "Clients actifs",
      value: clientsCount,
      description: "Clients enregistrés",
    },
    {
      title: "Véhicules",
      value: vehiclesCount,
      description: `${availableVehicles} disponibles`,
    },
    {
      title: "Contrats en cours",
      value: activeContracts,
      description: "Locations actives",
    },
    {
      title: "Amendes non traitées",
      value: fineStats.unprocessedCount,
      description: "Nouvelles ou rapprochées",
      href: "/dashboard/fines",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre activité de location
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.href && (
                <Button variant="link" className="mt-2 h-auto p-0" asChild>
                  <Link href={stat.href}>
                    Voir les amendes <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dernières amendes</CardTitle>
              <CardDescription>Infractions récemment enregistrées</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/fines">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {fineStats.recentFines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune amende.</p>
            ) : (
              <ul className="space-y-3">
                {fineStats.recentFines.map((fine) => (
                  <li
                    key={fine.id}
                    className="flex items-center justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <Link
                        href={`/dashboard/fines/${fine.id}`}
                        className="font-medium hover:underline"
                      >
                        {fine.licensePlate}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(fine.violationAt)} ·{" "}
                        {formatMoney(fine.amount)}
                      </p>
                    </div>
                    <FineStatusBadge status={fine.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Derniers rapprochements</CardTitle>
              <CardDescription>
                Amendes liées à un locataire
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/fines/new">Nouvelle amende</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {fineStats.recentMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun rapprochement pour le moment.
              </p>
            ) : (
              <ul className="space-y-3">
                {fineStats.recentMatches.map((fine) => (
                  <li
                    key={fine.id}
                    className="flex items-center justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <Link
                        href={`/dashboard/fines/${fine.id}`}
                        className="font-medium hover:underline"
                      >
                        {fine.licensePlate}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {fine.rentalContract?.client
                          ? `${fine.rentalContract.client.lastName} ${fine.rentalContract.client.firstName}`
                          : "—"}
                        {fine.matchedAt &&
                          ` · ${formatDateTime(fine.matchedAt)}`}
                      </p>
                    </div>
                    <FineStatusBadge status={fine.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
