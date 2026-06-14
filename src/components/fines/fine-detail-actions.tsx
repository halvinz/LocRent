"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FineStatus } from "@prisma/client";
import { toast } from "sonner";
import { Search } from "lucide-react";
import {
  linkFineAction,
  matchRenterAction,
  updateFineStatusAction,
} from "@/server/actions/fine.actions";
import { FineMatchCard } from "@/components/fines/fine-match-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FINE_STATUS_LABELS } from "@/types/enums";
import { formatDateTimeForInput } from "@/lib/utils";
import type { FineMatchResult } from "@/server/services/fine-matching.service";

interface FineDetailActionsProps {
  fineId: string;
  status: FineStatus;
  licensePlate: string;
  violationAt: Date;
  hasContract: boolean;
}

const WORKFLOW_STATUSES: FineStatus[] = [
  FineStatus.NEW,
  FineStatus.MATCHED,
  FineStatus.SENT,
  FineStatus.PAID,
  FineStatus.DISPUTED,
];

export function FineDetailActions({
  fineId,
  status,
  licensePlate,
  violationAt,
  hasContract,
}: FineDetailActionsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [plate, setPlate] = useState(licensePlate);
  const [at, setAt] = useState(formatDateTimeForInput(violationAt));
  const [matchResult, setMatchResult] = useState<FineMatchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleSearch() {
    setIsSearching(true);
    const result = await matchRenterAction({
      licensePlate: plate,
      violationAt: at,
    });
    setIsSearching(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setMatchResult(result.data ?? null);
  }

  async function handleLink() {
    if (!matchResult?.match) return;
    setIsUpdating(true);
    const result = await linkFineAction(fineId, {
      rentalContractId: matchResult.match.contract.id,
      vehicleId: matchResult.match.vehicle.id,
    });
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Amende liée au contrat");
    router.refresh();
  }

  async function handleStatusUpdate() {
    setIsUpdating(true);
    const result = await updateFineStatusAction(fineId, {
      status: selectedStatus,
    });
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Statut mis à jour");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {!hasContract && (
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Rapprochement manuel</h3>
            <p className="text-sm text-muted-foreground">
              Relancez la recherche ou corrigez la plaque / date de l&apos;infraction
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="link-plate">Plaque</Label>
              <Input
                id="link-plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-at">Date/heure</Label>
              <Input
                id="link-at"
                type="datetime-local"
                value={at}
                onChange={(e) => setAt(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSearch}
            disabled={isSearching}
          >
            <Search className="mr-2 h-4 w-4" />
            Rechercher le locataire
          </Button>
          {(isSearching || matchResult) && (
            <FineMatchCard
              result={matchResult}
              isLoading={isSearching}
              onConfirmLink={handleLink}
              confirmLabel="Lier cette amende au contrat"
              showConfirmButton={!!matchResult?.match}
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2 flex-1">
          <Label htmlFor="fine-status">Statut</Label>
          <select
            id="fine-status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FineStatus)}
          >
            {WORKFLOW_STATUSES.map((s) => (
              <option key={s} value={s}>
                {FINE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          onClick={handleStatusUpdate}
          disabled={isUpdating || selectedStatus === status}
        >
          Mettre à jour le statut
        </Button>
      </div>
    </div>
  );
}
