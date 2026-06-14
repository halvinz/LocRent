import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/tenant";
import { clientSearchSchema } from "@/lib/validations/client";
import { listClients } from "@/server/services/client.service";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
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
import { Eye } from "lucide-react";

export const metadata: Metadata = { title: "Clients" };

interface ClientsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { companyId } = await requireAuth();
  const params = clientSearchSchema.parse({
    page: searchParams.page,
    pageSize: searchParams.pageSize,
    q: searchParams.q,
    includeInactive: searchParams.includeInactive === "true",
  });

  const result = await listClients(companyId, params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Gérez vos clients locataires"
        action={{ label: "Nouveau client", href: "/dashboard/clients/new" }}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Suspense fallback={<div className="h-10 max-w-sm flex-1 animate-pulse rounded-md bg-muted" />}>
              <SearchBar placeholder="Nom, email, téléphone, permis…" />
            </Suspense>
            {params.includeInactive ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/clients">Actifs seulement</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/clients?includeInactive=true">
                  Inclure archivés
                </Link>
              </Button>
            )}
          </div>

          {result.items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucun client trouvé.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Permis</TableHead>
                  <TableHead>Contrats</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.lastName} {client.firstName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.email && <div>{client.email}</div>}
                        {client.phone && (
                          <div className="text-muted-foreground">{client.phone}</div>
                        )}
                        {!client.email && !client.phone && "—"}
                      </div>
                    </TableCell>
                    <TableCell>{client.drivingLicenseNumber ?? "—"}</TableCell>
                    <TableCell>{client._count.rentalContracts}</TableCell>
                    <TableCell>
                      {client.isActive ? (
                        <Badge variant="success">Actif</Badge>
                      ) : (
                        <Badge variant="muted">Archivé</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/clients/${client.id}`}>
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
