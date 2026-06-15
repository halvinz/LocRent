import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffPermission } from "@prisma/client";
import { guardPermission } from "@/lib/tenant/page-guard";
import { getVehicleById } from "@/server/services/vehicle.service";
import { formatDate } from "@/lib/utils";
import { RENTAL_CONTRACT_STATUS_LABELS } from "@/types/enums";
import { VehicleActions } from "@/components/vehicles/vehicle-actions";
import { VehicleStatusBadge } from "@/components/vehicles/vehicle-status-badge";
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

interface VehicleDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: VehicleDetailPageProps): Promise<Metadata> {
  try {
    const { companyId } = await guardPermission(StaffPermission.VEHICLES);
    const vehicle = await getVehicleById(companyId, params.id);
    return { title: vehicle.licensePlate };
  } catch {
    return { title: "Véhicule" };
  }
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { companyId } = await guardPermission(StaffPermission.VEHICLES);

  let vehicle;
  try {
    vehicle = await getVehicleById(companyId, params.id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl font-bold tracking-tight">
              {vehicle.licensePlate}
            </h2>
            <VehicleStatusBadge status={vehicle.status} />
            {!vehicle.isActive && <Badge variant="muted">Archivé</Badge>}
          </div>
          <p className="text-muted-foreground">
            {vehicle.make} {vehicle.model}
            {vehicle.trim && ` ${vehicle.trim}`}
            {vehicle.year && ` · ${vehicle.year}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <VehicleActions
            vehicleId={vehicle.id}
            isActive={vehicle.isActive}
            label={vehicle.licensePlate}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">VIN</span>
              <p className="font-mono">{vehicle.vin ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Couleur</span>
              <p>{vehicle.color ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Carburant</span>
              <p>{vehicle.fuelType ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Transmission</span>
              <p>{vehicle.transmission ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administratif</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Kilométrage</span>
              <p>
                {vehicle.currentMileage != null
                  ? `${vehicle.currentMileage.toLocaleString("fr-FR")} km`
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Ajouté le</span>
              <p>{formatDate(vehicle.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Carte grise</span>
              <p>
                {vehicle.registrationExpiry
                  ? formatDate(vehicle.registrationExpiry)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Assurance</span>
              <p>
                {vehicle.insuranceExpiry
                  ? formatDate(vehicle.insuranceExpiry)
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {vehicle.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{vehicle.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historique des contrats</CardTitle>
          <CardDescription>
            {vehicle._count.rentalContracts} contrat
            {vehicle._count.rentalContracts > 1 ? "s" : ""} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehicle.rentalContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun contrat</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicle.rentalContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.contractNumber ?? "—"}</TableCell>
                    <TableCell>
                      {contract.client.firstName} {contract.client.lastName}
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
