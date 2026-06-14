import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/tenant";
import { getClientById } from "@/server/services/client.service";
import { formatDate } from "@/lib/utils";
import { RENTAL_CONTRACT_STATUS_LABELS } from "@/types/enums";
import { ClientActions } from "@/components/clients/client-actions";
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
import { Pencil } from "lucide-react";

interface ClientDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: ClientDetailPageProps): Promise<Metadata> {
  try {
    const { companyId } = await requireAuth();
    const client = await getClientById(companyId, params.id);
    return {
      title: `${client.firstName} ${client.lastName}`,
    };
  } catch {
    return { title: "Client" };
  }
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { companyId } = await requireAuth();

  let client;
  try {
    client = await getClientById(companyId, params.id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {client.firstName} {client.lastName}
            </h2>
            {client.isActive ? (
              <Badge variant="success">Actif</Badge>
            ) : (
              <Badge variant="muted">Archivé</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Client depuis le {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${client.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <ClientActions
            clientId={client.id}
            isActive={client.isActive}
            clientName={`${client.firstName} ${client.lastName}`}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Email</span>
              <p>{client.email ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Téléphone</span>
              <p>{client.phone ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Adresse</span>
              <p>{client.address ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permis de conduire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Numéro</span>
              <p>{client.drivingLicenseNumber ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Délivrance</span>
              <p>
                {client.drivingLicenseIssuedAt
                  ? formatDate(client.drivingLicenseIssuedAt)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Expiration</span>
              <p>
                {client.drivingLicenseExpiryAt
                  ? formatDate(client.drivingLicenseExpiryAt)
                  : "—"}
              </p>
            </div>
            {(client.drivingLicenseFrontUrl || client.drivingLicenseBackUrl) && (
              <div className="flex gap-2 pt-2">
                {client.drivingLicenseFrontUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={client.drivingLicenseFrontUrl} target="_blank" rel="noreferrer">
                      Recto
                    </a>
                  </Button>
                )}
                {client.drivingLicenseBackUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={client.drivingLicenseBackUrl} target="_blank" rel="noreferrer">
                      Verso
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contrats récents</CardTitle>
          <CardDescription>
            {client._count.rentalContracts} contrat
            {client._count.rentalContracts > 1 ? "s" : ""} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {client.rentalContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun contrat</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.rentalContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.contractNumber ?? "—"}</TableCell>
                    <TableCell>
                      {contract.vehicle.licensePlate} — {contract.vehicle.make}{" "}
                      {contract.vehicle.model}
                    </TableCell>
                    <TableCell>
                      {formatDate(contract.startAt)} → {formatDate(contract.expectedEndAt)}
                    </TableCell>
                    <TableCell>
                      {RENTAL_CONTRACT_STATUS_LABELS[contract.status]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
