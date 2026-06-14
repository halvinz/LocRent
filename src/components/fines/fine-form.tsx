"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { VIOLATION_TYPES } from "@/config/fines";
import { fineFormSchema } from "@/lib/validations/fine";
import {
  createFineAndRedirectAction,
  matchRenterAction,
} from "@/server/actions/fine.actions";
import { FineMatchCard } from "@/components/fines/fine-match-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FineMatchResult } from "@/server/services/fine-matching.service";

type FineFormValues = {
  licensePlate: string;
  violationAt: string;
  violationType?: string;
  amount: string;
  referenceNumber?: string;
  issuingAuthority?: string;
  notes?: string;
  rentalContractId?: string;
  vehicleId?: string;
};

export function FineForm() {
  const router = useRouter();
  const [matchResult, setMatchResult] = useState<FineMatchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [linkConfirmed, setLinkConfirmed] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FineFormValues>({
    defaultValues: {
      licensePlate: "",
      violationAt: "",
      violationType: "",
      amount: "",
      referenceNumber: "",
      issuingAuthority: "",
      notes: "",
      rentalContractId: "",
      vehicleId: "",
    },
  });

  const rentalContractId = watch("rentalContractId");
  const vehicleId = watch("vehicleId");

  async function handleSearchRenter() {
    const licensePlate = getValues("licensePlate");
    const violationAt = getValues("violationAt");

    if (!licensePlate.trim() || !violationAt) {
      toast.error("Saisissez la plaque et la date/heure avant de rechercher");
      return;
    }

    setIsSearching(true);
    setLinkConfirmed(false);
    setValue("rentalContractId", "");
    setValue("vehicleId", "");

    const result = await matchRenterAction({ licensePlate, violationAt });
    setIsSearching(false);

    if (!result.success) {
      toast.error(result.error);
      setMatchResult(null);
      return;
    }

    setMatchResult(result.data ?? null);
    if (result.data?.match) {
      toast.success("Locataire trouvé — confirmez la liaison si nécessaire");
    } else {
      toast.message(result.data?.message ?? "Aucun résultat");
    }
  }

  function handleConfirmLink() {
    if (!matchResult?.match) return;
    setValue("rentalContractId", matchResult.match.contract.id);
    setValue("vehicleId", matchResult.match.vehicle.id);
    setLinkConfirmed(true);
    toast.success("Contrat sélectionné — enregistrez l'amende pour confirmer");
  }

  async function onSubmit(data: FineFormValues) {
    const parsed = fineFormSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      toast.error(first?.message ?? "Formulaire invalide");
      return;
    }

    const result = await createFineAndRedirectAction(parsed.data);
    if (!result.success) {
      setError("root", { message: result.error });
      toast.error(result.error);
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Infraction</CardTitle>
          <CardDescription>
            Plaque et date/heure pour le rapprochement automatique au locataire
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="licensePlate">Plaque d&apos;immatriculation *</Label>
            <Input
              id="licensePlate"
              placeholder="AB-123-CD"
              {...register("licensePlate", { required: true })}
            />
            {errors.licensePlate && (
              <p className="text-sm text-destructive">Plaque requise</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="violationAt">Date et heure de l&apos;infraction *</Label>
            <Input
              id="violationAt"
              type="datetime-local"
              {...register("violationAt", { required: true })}
            />
            {errors.violationAt && (
              <p className="text-sm text-destructive">Date/heure requise</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSearchRenter}
              disabled={isSearching}
            >
              <Search className="mr-2 h-4 w-4" />
              Rechercher le locataire
            </Button>
          </div>
        </CardContent>
      </Card>

      {(isSearching || matchResult) && (
        <FineMatchCard
          result={matchResult}
          isLoading={isSearching}
          onConfirmLink={handleConfirmLink}
          showConfirmButton={!!matchResult?.match && !linkConfirmed}
        />
      )}

      {linkConfirmed && rentalContractId && vehicleId && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Liaison confirmée avec le contrat sélectionné.
        </p>
      )}

      <input type="hidden" {...register("rentalContractId")} />
      <input type="hidden" {...register("vehicleId")} />

      <Card>
        <CardHeader>
          <CardTitle>Détails de l&apos;amende</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="violationType">Type d&apos;infraction</Label>
            <select
              id="violationType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("violationType")}
            >
              <option value="">— Sélectionner —</option>
              {VIOLATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="135.00"
              {...register("amount", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Numéro de référence</Label>
            <Input id="referenceNumber" {...register("referenceNumber")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuingAuthority">Autorité émettrice</Label>
            <Input
              id="issuingAuthority"
              placeholder="Antai, Ville de Paris…"
              {...register("issuingAuthority")}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Enregistrement…" : "Enregistrer l'amende"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/fines")}
          className="w-full sm:w-auto"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
