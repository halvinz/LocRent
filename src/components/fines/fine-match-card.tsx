"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  FileText,
  SearchX,
  User,
} from "lucide-react";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { FineMatchResult } from "@/server/services/fine-matching.service";

interface FineMatchCardProps {
  result: FineMatchResult | null;
  isLoading?: boolean;
  onConfirmLink?: () => void;
  confirmLabel?: string;
  showConfirmButton?: boolean;
}

export function FineMatchCard({
  result,
  isLoading,
  onConfirmLink,
  confirmLabel = "Lier cette amende au contrat",
  showConfirmButton = true,
}: FineMatchCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recherche en cours…</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  if (result.conflict) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" />
            Conflit de rapprochement
          </CardTitle>
          <CardDescription>{result.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!result.match) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <SearchX className="h-5 w-5 text-muted-foreground" />
            Aucun locataire trouvé
          </CardTitle>
          <CardDescription>{result.message}</CardDescription>
        </CardHeader>
        {result.vehicleFound && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Le véhicule est connu dans votre parc, mais aucun contrat ne couvre
              la date/heure indiquée. Vérifiez la plaque ou la date de
              l&apos;infraction.
            </p>
          </CardContent>
        )}
      </Card>
    );
  }

  const { match } = result;
  const clientName = `${match.client.lastName} ${match.client.firstName}`;

  return (
    <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
          Locataire identifié
        </CardTitle>
        <CardDescription>{result.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Client
              </p>
              <p className="font-medium">{clientName}</p>
              {match.client.email && (
                <p className="text-sm text-muted-foreground">{match.client.email}</p>
              )}
              {match.client.drivingLicenseNumber && (
                <p className="text-sm">
                  Permis : {match.client.drivingLicenseNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
            <Car className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Véhicule
              </p>
              <p className="font-medium">{match.vehicle.licensePlate}</p>
              <p className="text-sm text-muted-foreground">
                {match.vehicle.make} {match.vehicle.model}
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border bg-background/80 p-3 sm:col-span-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Contrat
                </p>
                <ContractStatusBadge status={match.contract.status} />
              </div>
              <p className="font-medium">
                {match.contract.contractNumber ?? match.contract.id.slice(0, 8)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(match.contract.startAt)} →{" "}
                {formatDateTime(match.contract.effectiveEndAt)}
              </p>
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <Link href={`/dashboard/contracts/${match.contract.id}`}>
                  Voir le contrat
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {showConfirmButton && onConfirmLink && (
          <Button type="button" onClick={onConfirmLink}>
            {confirmLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
