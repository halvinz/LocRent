import Link from "next/link";
import type { Route } from "next";
import type { Metadata } from "next";
import { InspectionType, RentalContractStatus } from "@prisma/client";
import { requireAuth } from "@/lib/tenant";
import { getInspectionsOverview } from "@/server/services/inspection.service";
import { PageHeader } from "@/components/shared/page-header";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableScroll } from "@/components/shared/data-table-scroll";
import { MobileListCard } from "@/components/shared/mobile-list-card";
import { formatDateTime } from "@/lib/utils";
import { INSPECTION_TYPE_LABELS } from "@/types/enums";
import { CheckCircle2, ClipboardList, Eye } from "lucide-react";

export const metadata: Metadata = { title: "États des lieux" };

function InspectionStatusBadge({ done, label }: { done: boolean; label: string }) {
  if (done) {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {label}
      </Badge>
    );
  }
  return <Badge variant="muted">{label} — à faire</Badge>;
}

export default async function InspectionsPage() {
  const { companyId } = await requireAuth();
  const { queue, recentInspections } = await getInspectionsOverview(companyId);

  const pendingCount = queue.filter((c) => c.needsCheckout || c.needsCheckin).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="États des lieux"
        description="Prise en charge (départ) et restitution (retour) des véhicules"
      />

      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="list-inside list-decimal space-y-1">
            <li>Créez un contrat (brouillon)</li>
            <li>Renseignez l&apos;<strong>état des lieux départ</strong> avant activation</li>
            <li>Activez le contrat — le véhicule passe en « loué »</li>
            <li>Au retour, saisissez l&apos;<strong>état des lieux retour</strong> puis clôturez</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contrats en cours</CardTitle>
          <CardDescription>
            {pendingCount > 0
              ? `${pendingCount} contrat${pendingCount > 1 ? "s" : ""} avec état des lieux à compléter`
              : "Tous les états des lieux sont à jour pour les contrats actifs"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {queue.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Aucun contrat brouillon ou actif.{" "}
              <Link href="/dashboard/contracts/new" className="text-primary hover:underline">
                Créer un contrat
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {queue.map((item) => (
                  <MobileListCard
                    key={item.id}
                    href={`/dashboard/contracts/${item.id}` as Route}
                    title={item.contractNumber ?? "Contrat"}
                    subtitle={`${item.clientName} · ${item.vehicleLabel}`}
                    meta={
                      <>
                        <ContractStatusBadge status={item.status} />
                        <InspectionStatusBadge
                          done={item.hasCheckout}
                          label="Départ"
                        />
                        {item.status === RentalContractStatus.ACTIVE && (
                          <InspectionStatusBadge
                            done={item.hasCheckin}
                            label="Retour"
                          />
                        )}
                      </>
                    }
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <DataTableScroll>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contrat</TableHead>
                        <TableHead>Client / Véhicule</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Départ</TableHead>
                        <TableHead>Retour</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queue.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.contractNumber ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div>{item.clientName}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.vehicleLabel}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ContractStatusBadge status={item.status} />
                          </TableCell>
                          <TableCell>
                            <InspectionStatusBadge
                              done={item.hasCheckout}
                              label="Départ"
                            />
                          </TableCell>
                          <TableCell>
                            {item.status === RentalContractStatus.ACTIVE ? (
                              <InspectionStatusBadge
                                done={item.hasCheckin}
                                label="Retour"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/dashboard/contracts/${item.id}/checkout` as Route}
                                >
                                  <ClipboardList className="mr-1 h-3 w-3" />
                                  Départ
                                </Link>
                              </Button>
                              {item.status === RentalContractStatus.ACTIVE && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/dashboard/contracts/${item.id}/checkin` as Route}
                                  >
                                    <ClipboardList className="mr-1 h-3 w-3" />
                                    Retour
                                  </Link>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/contracts/${item.id}` as Route}>
                                  <Eye className="mr-1 h-3 w-3" />
                                  Voir
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DataTableScroll>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {recentInspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Derniers enregistrements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {INSPECTION_TYPE_LABELS[inspection.type]} —{" "}
                    {inspection.rentalContract.contractNumber ?? "Contrat"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {inspection.rentalContract.client.lastName}{" "}
                    {inspection.rentalContract.client.firstName} ·{" "}
                    {inspection.rentalContract.vehicle.licensePlate} ·{" "}
                    {formatDateTime(inspection.performedAt)}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/dashboard/contracts/${inspection.rentalContract.id}` as Route}
                  >
                    Voir le contrat
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
