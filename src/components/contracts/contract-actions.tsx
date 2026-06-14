"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RentalContractStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  activateContractAction,
  cancelContractAction,
  completeContractAction,
  deleteContractAction,
} from "@/server/actions/contract.actions";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContractActionsProps {
  contractId: string;
  status: RentalContractStatus;
  contractNumber?: string | null;
}

export function ContractActions({
  contractId,
  status,
  contractNumber,
}: ContractActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actualEndAt, setActualEndAt] = useState("");
  const [endMileage, setEndMileage] = useState("");
  const [endFuelLevel, setEndFuelLevel] = useState("");

  async function handleActivate() {
    setLoading(true);
    const result = await activateContractAction(contractId);
    setLoading(false);
    if (result.success) {
      toast.success("Contrat activé — véhicule en statut loué");
      router.refresh();
    } else toast.error(result.error ?? "Erreur");
  }

  async function handleCancel() {
    setLoading(true);
    const result = await cancelContractAction(contractId);
    setLoading(false);
    if (result.success) {
      toast.success("Contrat annulé");
      router.refresh();
    } else toast.error(result.error ?? "Erreur");
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteContractAction(contractId);
    setLoading(false);
    if (result.success) {
      toast.success("Contrat supprimé");
      router.push("/dashboard/contracts");
      router.refresh();
    } else toast.error(result.error ?? "Erreur");
  }

  async function handleComplete() {
    setLoading(true);
    const result = await completeContractAction(contractId, {
      actualEndAt,
      endMileage: endMileage || undefined,
      endFuelLevel: endFuelLevel || undefined,
    });
    setLoading(false);
    if (result.success) {
      toast.success("Contrat clôturé — véhicule disponible");
      router.refresh();
    } else toast.error(result.error ?? "Erreur");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === RentalContractStatus.DRAFT && (
        <Button onClick={handleActivate} disabled={loading}>
          Activer le contrat
        </Button>
      )}

      {status === RentalContractStatus.ACTIVE && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={loading}>Clôturer</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clôturer le contrat</AlertDialogTitle>
              <AlertDialogDescription>
                Saisissez les informations de retour du véhicule.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-2">
                <Label>Date/heure de retour</Label>
                <Input
                  type="datetime-local"
                  value={actualEndAt}
                  onChange={(e) => setActualEndAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kilométrage retour</Label>
                <Input
                  type="number"
                  value={endMileage}
                  onChange={(e) => setEndMileage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Carburant (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={endFuelLevel}
                  onChange={(e) => setEndFuelLevel(e.target.value)}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleComplete}>Clôturer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {(status === RentalContractStatus.DRAFT ||
        status === RentalContractStatus.ACTIVE) && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={loading}>
              Annuler le contrat
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Annuler ce contrat ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le contrat passera en statut annulé. Le véhicule redeviendra
                disponible si le contrat était actif.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Non</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>
                Confirmer l&apos;annulation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {(status === RentalContractStatus.DRAFT ||
        status === RentalContractStatus.CANCELLED) && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce contrat ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le contrat{" "}
                <strong>{contractNumber ?? "sans numéro"}</strong> sera
                définitivement supprimé avec ses états des lieux. Cette action
                est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
