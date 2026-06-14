"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FineStatus } from "@prisma/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteFineAction } from "@/server/actions/fine.actions";
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

interface FineActionsProps {
  fineId: string;
  licensePlate: string;
  status: FineStatus;
}

export function FineActions({
  fineId,
  licensePlate,
  status,
}: FineActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === FineStatus.PAID) {
    return null;
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteFineAction(fineId);
    setLoading(false);

    if (result.success) {
      toast.success("Amende supprimée");
      router.push("/dashboard/fines");
      router.refresh();
    } else {
      toast.error(result.error ?? "Erreur lors de la suppression");
    }
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
          <AlertDialogTitle>Supprimer cette amende ?</AlertDialogTitle>
          <AlertDialogDescription>
            L&apos;amende pour la plaque <strong>{licensePlate}</strong> sera
            définitivement supprimée. Cette action est irréversible.
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
