import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { Metadata } from "next";
import { RentalContractStatus } from "@prisma/client";
import { requireAuth } from "@/lib/tenant";
import { contractSearchSchema } from "@/lib/validations/contract";
import { listContracts } from "@/server/services/contract.service";
import { formatDateTime } from "@/lib/utils";
import { RENTAL_CONTRACT_STATUS_LABELS } from "@/types/enums";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { DataTableScroll } from "@/components/shared/data-table-scroll";
import { MobileListCard } from "@/components/shared/mobile-list-card";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
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

export const metadata: Metadata = { title: "Contrats" };

interface ContractsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const { companyId } = await requireAuth();
  const params = contractSearchSchema.parse({
    page: searchParams.page,
    pageSize: searchParams.pageSize,
    q: searchParams.q,
    status: searchParams.status,
    clientId: searchParams.clientId,
    vehicleId: searchParams.vehicleId,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
  });

  const { items, total, page, totalPages } = await listContracts(companyId, params);

  function buildFilterUrl(updates: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status) sp.set("status", params.status);
    if (params.clientId) sp.set("clientId", params.clientId);
    if (params.vehicleId) sp.set("vehicleId", params.vehicleId);
    if (params.dateFrom) sp.set("dateFrom", params.dateFrom.toISOString().slice(0, 10));
    if (params.dateTo) sp.set("dateTo", params.dateTo.toISOString().slice(0, 10));
    for (const [k, v] of Object.entries(updates)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    const qs = sp.toString();
    return (qs ? `/dashboard/contracts?${qs}` : "/dashboard/contracts") as Route;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contrats de location"
        description="Gérez les locations en cours et à venir"
        action={{ label: "Nouveau contrat", href: "/dashboard/contracts/new" }}
      />

      <Card>
        <CardContent className="p-4 pt-6 sm:p-6">
          <div className="mb-4 flex flex-col gap-4">
            <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
              <SearchBar placeholder="N° contrat, client, plaque…" />
            </Suspense>
            <div className="flex flex-wrap gap-2">
              <Button variant={!params.status ? "default" : "outline"} size="sm" asChild>
                <Link href={buildFilterUrl({ status: undefined })}>Tous</Link>
              </Button>
              {Object.values(RentalContractStatus).map((s) => (
                <Button
                  key={s}
                  variant={params.status === s ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link href={buildFilterUrl({ status: s })}>{RENTAL_CONTRACT_STATUS_LABELS[s]}</Link>
                </Button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucun contrat</div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((c) => (
                  <MobileListCard
                    key={c.id}
                    href={`/dashboard/contracts/${c.id}`}
                    title={c.contractNumber ?? "Contrat"}
                    subtitle={`${c.client.lastName} ${c.client.firstName} · ${c.vehicle.licensePlate}`}
                    meta={
                      <>
                        <ContractStatusBadge status={c.status} />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(c.startAt)} → {formatDateTime(c.expectedEndAt)}
                        </span>
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
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden lg:table-cell">Véhicule</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.contractNumber ?? "—"}</TableCell>
                    <TableCell>{c.client.lastName} {c.client.firstName}</TableCell>
                    <TableCell className="hidden font-mono lg:table-cell">{c.vehicle.licensePlate}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(c.startAt)}
                      <br />
                      <span className="text-muted-foreground">→ {formatDateTime(c.expectedEndAt)}</span>
                    </TableCell>
                    <TableCell><ContractStatusBadge status={c.status} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/contracts/${c.id}` as Route}><Eye className="h-4 w-4" /></Link>
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
              <Pagination page={page} totalPages={totalPages} total={total} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
