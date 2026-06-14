"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, RotateCcw } from "lucide-react";
import {
  deleteClientAction,
  restoreClientAction,
} from "@/server/actions/client.actions";
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

interface ClientActionsProps {
  clientId: string;
  isActive: boolean;
  clientName: string;
}

export function ClientActions({
  clientId,
  isActive,
  clientName,
}: ClientActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteClientAction(clientId);
    setLoading(false);

    if (result.success) {
      toast.success("Client archivé");
      router.push("/dashboard/clients");
      router.refresh();
    } else {
      toast.error(result.error ?? "Erreur lors de la suppression");
    }
  }

  async function handleRestore() {
    setLoading(true);
    const result = await restoreClientAction(clientId);
    setLoading(false);

    if (result.success) {
      toast.success("Client restauré");
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
          Archiver
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver ce client ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le client <strong>{clientName}</strong> sera masqué des listes
            actives. Ses contrats existants seront conservés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Archiver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
