"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, RotateCcw } from "lucide-react";
import {
  deleteVehicleAction,
  restoreVehicleAction,
} from "@/server/actions/vehicle.actions";
import { Button } from "@/components/ui/button";
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

interface VehicleActionsProps {
  vehicleId: string;
  isActive: boolean;
  label: string;
}

export function VehicleActions({
  vehicleId,
  isActive,
  label,
}: VehicleActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteVehicleAction(vehicleId);
    setLoading(false);

    if (result.success) {
      toast.success("Véhicule supprimé");
      router.push("/dashboard/vehicles");
      router.refresh();
    } else {
      toast.error(result.error ?? "Erreur lors de la suppression");
    }
  }

  async function handleRestore() {
    setLoading(true);
    const result = await restoreVehicleAction(vehicleId);
    setLoading(false);

    if (result.success) {
      toast.success("Véhicule restauré");
      router.refresh();
    } else {
      toast.error(result.error ?? "Erreur lors de la restauration");
    }
  }

  if (!isActive) {
    return (
      <Button variant="outline" onClick={handleRestore} disabled={loading}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Restaurer
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={loading}>
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le véhicule <strong>{label}</strong> sera retiré du parc actif.
            Son historique de contrats sera conservé. Vous pourrez le restaurer
            depuis la liste des véhicules archivés.
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
  );
}
