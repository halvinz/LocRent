import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/tenant";
import { fineSearchSchema } from "@/lib/validations/fine";
import { listFines } from "@/server/services/fine.service";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { FineStatusBadge } from "@/components/fines/fine-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { FINE_STATUS_LABELS } from "@/types/enums";
import { FineStatus } from "@prisma/client";
import { Eye } from "lucide-react";

export const metadata: Metadata = { title: "Amendes" };

interface FinesPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function FinesPage({ searchParams }: FinesPageProps) {
  const { companyId } = await requireAuth();
  const params = fineSearchSchema.parse({
    page: searchParams.page,
    pageSize: searchParams.pageSize,
    q: searchParams.q,
    status: searchParams.status,
  });

  const result = await listFines(companyId, params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Amendes"
        description="Rapprochement automatique plaque + date/heure au locataire responsable"
        action={{ label: "Nouvelle amende", href: "/dashboard/fines/new" }}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Suspense
              fallback={
                <div className="h-10 max-w-sm flex-1 animate-pulse rounded-md bg-muted" />
              }
            >
              <SearchBar placeholder="Plaque, référence, type…" />
            </Suspense>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={params.status ? "outline" : "secondary"}
                size="sm"
                asChild
              >
                <Link href="/dashboard/fines">Toutes</Link>
              </Button>
              {(
                [
                  FineStatus.NEW,
                  FineStatus.MATCHED,
                  FineStatus.SENT,
                  FineStatus.PAID,
                  FineStatus.DISPUTED,
                ] as const
              ).map((status) => (
                <Button
                  key={status}
                  variant={params.status === status ? "secondary" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link href={`/dashboard/fines?status=${status}`}>
                    {FINE_STATUS_LABELS[status]}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {result.items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucune amende trouvée.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plaque</TableHead>
                  <TableHead>Infraction</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell className="font-medium">
                      {fine.licensePlate}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(fine.violationAt)}
                      </div>
                      {fine.violationType && (
                        <div className="text-xs text-muted-foreground">
                          {fine.violationType}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {fine.rentalContract?.client ? (
                        <div>
                          <div>
                            {fine.rentalContract.client.lastName}{" "}
                            {fine.rentalContract.client.firstName}
                          </div>
                          {fine.rentalContract.contractNumber && (
                            <div className="text-xs text-muted-foreground">
                              {fine.rentalContract.contractNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Non rapprochée</span>
                      )}
                    </TableCell>
                    <TableCell>{formatMoney(fine.amount)}</TableCell>
                    <TableCell>
                      <FineStatusBadge status={fine.status} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/fines/${fine.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
