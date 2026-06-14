import Link from "next/link";
import type { Route } from "next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InspectionType, RentalContractStatus } from "@prisma/client";
import { requireAuth } from "@/lib/tenant";
import { getContractById, getInspectionByType } from "@/server/services/contract.service";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
import { ContractActions } from "@/components/contracts/contract-actions";
import { InspectionComparison } from "@/components/inspections/inspection-comparison";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, FileDown, ClipboardList } from "lucide-react";

interface ContractDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ContractDetailPageProps): Promise<Metadata> {
  try {
    const { companyId } = await requireAuth();
    const c = await getContractById(companyId, params.id);
    return { title: c.contractNumber ?? "Contrat" };
  } catch {
    return { title: "Contrat" };
  }
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const { companyId } = await requireAuth();

  let contract;
  try {
    contract = await getContractById(companyId, params.id);
  } catch {
    notFound();
  }

  const checkout = getInspectionByType(contract, InspectionType.CHECKOUT);
  const checkin = getInspectionByType(contract, InspectionType.CHECKIN);
  const canEdit = contract.status === RentalContractStatus.DRAFT;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl font-bold">{contract.contractNumber}</h2>
            <ContractStatusBadge status={contract.status} />
          </div>
          <p className="text-muted-foreground">
            {contract.client.lastName} {contract.client.firstName} — {contract.vehicle.licensePlate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/contracts/${contract.id}/edit` as Route}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer">
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </a>
          </Button>
          {(contract.status === RentalContractStatus.DRAFT ||
            contract.status === RentalContractStatus.ACTIVE) && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/contracts/${contract.id}/checkout` as Route}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  État départ
                </Link>
              </Button>
              {contract.status === RentalContractStatus.ACTIVE && (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/contracts/${contract.id}/checkin` as Route}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    État retour
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <ContractActions
        contractId={contract.id}
        status={contract.status}
        contractNumber={contract.contractNumber}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Période</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Début :</span> {formatDateTime(contract.startAt)}</p>
            <p><span className="text-muted-foreground">Fin prévue :</span> {formatDateTime(contract.expectedEndAt)}</p>
            {contract.actualEndAt && (
              <p><span className="text-muted-foreground">Retour :</span> {formatDateTime(contract.actualEndAt)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tarification</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Journalier :</span> {formatMoney(contract.dailyPrice)}</p>
            <p><span className="text-muted-foreground">Caution :</span> {formatMoney(contract.depositAmount)}</p>
            {contract.includedMileage != null && (
              <p><span className="text-muted-foreground">Km inclus :</span> {contract.includedMileage} km</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Kilométrage</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Départ :</span> {contract.startMileage?.toLocaleString("fr-FR") ?? "—"} km</p>
            <p><span className="text-muted-foreground">Retour :</span> {contract.endMileage?.toLocaleString("fr-FR") ?? "—"} km</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Carburant</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Départ :</span> {contract.startFuelLevel != null ? `${contract.startFuelLevel} %` : "—"}</p>
            <p><span className="text-muted-foreground">Retour :</span> {contract.endFuelLevel != null ? `${contract.endFuelLevel} %` : "—"}</p>
          </CardContent>
        </Card>
      </div>

      {contract.terms && (
        <Card>
          <CardHeader><CardTitle>Clauses</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{contract.terms}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>États des lieux — comparaison</CardTitle></CardHeader>
        <CardContent>
          <InspectionComparison checkout={checkout} checkin={checkin} />
        </CardContent>
      </Card>
    </div>
  );
}
