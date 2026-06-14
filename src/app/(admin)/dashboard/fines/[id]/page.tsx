import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/tenant";
import { getFineById } from "@/server/services/fine.service";
import { FineStatusBadge } from "@/components/fines/fine-status-badge";
import { FineMatchTimeline } from "@/components/fines/fine-match-timeline";
import { FineDetailActions } from "@/components/fines/fine-detail-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, formatMoney } from "@/lib/utils";

interface FineDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: FineDetailPageProps): Promise<Metadata> {
  try {
    const { companyId } = await requireAuth();
    const fine = await getFineById(companyId, params.id);
    return {
      title: `Amende ${fine.licensePlate}`,
    };
  } catch {
    return { title: "Amende" };
  }
}

export default async function FineDetailPage({ params }: FineDetailPageProps) {
  const { companyId } = await requireAuth();

  let fine;
  try {
    fine = await getFineById(companyId, params.id);
  } catch {
    notFound();
  }

  const client = fine.rentalContract?.client;
  const clientName = client
    ? `${client.lastName} ${client.firstName}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/fines">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">
                Amende {fine.licensePlate}
              </h2>
              <FineStatusBadge status={fine.status} />
            </div>
            <p className="text-muted-foreground">
              Infraction du {formatDateTime(fine.violationAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
            <CardDescription>Informations de l&apos;amende reçue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Montant :</span>{" "}
              {formatMoney(fine.amount)}
            </p>
            <p>
              <span className="text-muted-foreground">Type :</span>{" "}
              {fine.violationType ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Référence :</span>{" "}
              {fine.referenceNumber ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Autorité :</span>{" "}
              {fine.issuingAuthority ?? "—"}
            </p>
            {fine.notes && (
              <p>
                <span className="text-muted-foreground">Notes :</span>{" "}
                {fine.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapprochement</CardTitle>
            <CardDescription>
              Locataire et contrat identifiés pour cette infraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {fine.rentalContract ? (
              <>
                <p>
                  <span className="text-muted-foreground">Client :</span>{" "}
                  {clientName}
                  {client?.drivingLicenseNumber && (
                    <span className="text-muted-foreground">
                      {" "}
                      (permis {client.drivingLicenseNumber})
                    </span>
                  )}
                </p>
                <p>
                  <span className="text-muted-foreground">Contrat :</span>{" "}
                  <Link
                    href={`/dashboard/contracts/${fine.rentalContract.id}`}
                    className="text-primary hover:underline"
                  >
                    {fine.rentalContract.contractNumber ??
                      fine.rentalContract.id.slice(0, 8)}
                  </Link>
                </p>
                <p>
                  <span className="text-muted-foreground">Période :</span>{" "}
                  {formatDateTime(fine.rentalContract.startAt)} →{" "}
                  {formatDateTime(
                    fine.rentalContract.actualEndAt ??
                      fine.rentalContract.expectedEndAt,
                  )}
                </p>
                {fine.vehicle && (
                  <p>
                    <span className="text-muted-foreground">Véhicule :</span>{" "}
                    {fine.vehicle.licensePlate} — {fine.vehicle.make}{" "}
                    {fine.vehicle.model}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                Aucun contrat lié. Utilisez le rapprochement ci-dessous.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <FineMatchTimeline
        status={fine.status}
        createdAt={fine.createdAt}
        matchedAt={fine.matchedAt}
        hasContract={!!fine.rentalContractId}
        clientName={clientName}
        contractNumber={fine.rentalContract?.contractNumber}
      />

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <FineDetailActions
            fineId={fine.id}
            status={fine.status}
            licensePlate={fine.licensePlate}
            violationAt={fine.violationAt}
            hasContract={!!fine.rentalContractId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
