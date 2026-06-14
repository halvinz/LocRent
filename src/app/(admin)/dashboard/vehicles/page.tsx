import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { Metadata } from "next";
import { VehicleStatus } from "@prisma/client";
import { requireAuth } from "@/lib/tenant";
import { vehicleSearchSchema } from "@/lib/validations/vehicle";
import { listVehicles } from "@/server/services/vehicle.service";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { DataTableScroll } from "@/components/shared/data-table-scroll";
import { MobileListCard } from "@/components/shared/mobile-list-card";
import { VehicleStatusBadge } from "@/components/vehicles/vehicle-status-badge";
import { VEHICLE_STATUS_LABELS } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";

export const metadata: Metadata = { title: "Véhicules" };

interface VehiclesPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const { companyId } = await requireAuth();
  const params = vehicleSearchSchema.parse({
    page: searchParams.page,
    pageSize: searchParams.pageSize,
    q: searchParams.q,
    status: searchParams.status,
    includeInactive: searchParams.includeInactive === "true",
  });

  const result = await listVehicles(companyId, params);

  function buildStatusHref(status?: VehicleStatus) {
    const sp = new URLSearchParams();
    if (searchParams.q) sp.set("q", String(searchParams.q));
    if (status) sp.set("status", status);
    if (params.includeInactive) sp.set("includeInactive", "true");
    const qs = sp.toString();
    return qs ? `/dashboard/vehicles?${qs}` : "/dashboard/vehicles";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Véhicules"
        description="Gérez votre parc automobile"
        action={{ label: "Nouveau véhicule", href: "/dashboard/vehicles/new" }}
      />

      <Card>
        <CardContent className="p-4 pt-6 sm:p-6">
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Suspense fallback={<div className="h-10 max-w-sm flex-1 animate-pulse rounded-md bg-muted" />}>
                <SearchBar placeholder="Plaque, marque, modèle, VIN…" />
              </Suspense>
              {params.includeInactive ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildStatusHref(params.status) as Route}>Actifs seulement</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`${buildStatusHref(params.status)}${buildStatusHref(params.status).includes("?") ? "&" : "?"}includeInactive=true` as Route}>
                    Inclure archivés
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!params.status ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={buildStatusHref() as Route}>Tous</Link>
              </Button>
              {Object.values(VehicleStatus).map((s) => (
                <Button
                  key={s}
                  variant={params.status === s ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link href={buildStatusHref(s) as Route}>{VEHICLE_STATUS_LABELS[s]}</Link>
                </Button>
              ))}
            </div>
          </div>

          {result.items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucun véhicule trouvé.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {result.items.map((vehicle) => (
                  <MobileListCard
                    key={vehicle.id}
                    href={`/dashboard/vehicles/${vehicle.id}`}
                    title={vehicle.licensePlate}
                    subtitle={`${vehicle.make} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ""}`}
                    meta={
                      <>
                        <VehicleStatusBadge status={vehicle.status} />
                        {!vehicle.isActive && <Badge variant="muted">Archivé</Badge>}
                        {vehicle.currentMileage != null && (
                          <span className="text-xs text-muted-foreground">
                            {vehicle.currentMileage.toLocaleString("fr-FR")} km
                          </span>
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
                  <TableHead>Plaque</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead className="hidden lg:table-cell">Km</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Contrats</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium">
                      {vehicle.licensePlate}
                      {!vehicle.isActive && (
                        <Badge variant="muted" className="ml-2">
                          Archivé
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehicle.make} {vehicle.model}
                      {vehicle.year && (
                        <span className="text-muted-foreground"> ({vehicle.year})</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {vehicle.currentMileage != null
                        ? `${vehicle.currentMileage.toLocaleString("fr-FR")} km`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <VehicleStatusBadge status={vehicle.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {vehicle._count.rentalContracts}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                </DataTableScroll>
              </div>
            </>
          )}

          <div className="mt-4">
            <Suspense>
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
              />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
