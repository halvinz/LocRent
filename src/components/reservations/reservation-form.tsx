"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { reservationFormSchema } from "@/lib/validations/reservation";
import { createReservationAndRedirectAction } from "@/server/actions/reservation.actions";
import { SearchableSelect } from "@/components/shared/searchable-select";
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

type VehicleOption = {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
};

type ReservationFormValues = {
  guestName: string;
  phone?: string;
  snapchat?: string;
  depositAmount?: string | number;
  vehicleId?: string;
  notes?: string;
};

interface ReservationFormProps {
  vehicles: VehicleOption[];
}

export function ReservationForm({ vehicles }: ReservationFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ReservationFormValues>({
    defaultValues: {
      guestName: "",
      phone: "",
      snapchat: "",
      depositAmount: "",
      vehicleId: "",
      notes: "",
    },
  });

  const vehicleId = watch("vehicleId");

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.licensePlate} — ${vehicle.make} ${vehicle.model}`,
    searchText: `${vehicle.licensePlate} ${vehicle.make} ${vehicle.model}`,
  }));

  async function onSubmit(data: ReservationFormValues) {
    const parsed = reservationFormSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) {
          setError(field as keyof ReservationFormValues, {
            message: issue.message,
          });
        }
      }
      toast.error(
        parsed.error.issues[0]?.message ?? "Veuillez corriger les erreurs",
      );
      return;
    }

    const result = await createReservationAndRedirectAction(parsed.data);
    if (!result) return;

    if (result.success) {
      toast.success("Réservation enregistrée");
      window.dispatchEvent(new Event("reservations:updated"));
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages[0]) {
          setError(field as keyof ReservationFormValues, { message: messages[0] });
        }
      }
    }
    toast.error(result.error ?? "Erreur");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client réservé</CardTitle>
          <CardDescription>
            Pour qui la réservation a été prise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Nom du client *</Label>
            <Input
              id="guestName"
              placeholder="Nom et prénom du locataire"
              {...register("guestName")}
            />
            {errors.guestName && (
              <p className="text-sm text-destructive">{errors.guestName.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="snapchat">Snapchat</Label>
              <Input
                id="snapchat"
                placeholder="@pseudo"
                {...register("snapchat")}
              />
              {errors.snapchat && (
                <p className="text-sm text-destructive">
                  {errors.snapchat.message}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Indiquez au moins un téléphone ou un Snap pour contacter le client.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="depositAmount">Acompte (€) *</Label>
            <Input
              id="depositAmount"
              type="number"
              step="0.01"
              min={0}
              placeholder="150"
              {...register("depositAmount")}
            />
            {errors.depositAmount && (
              <p className="text-sm text-destructive">
                {errors.depositAmount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Véhicule (optionnel)</Label>
            <SearchableSelect
              options={vehicleOptions}
              value={vehicleId || undefined}
              onValueChange={(value) =>
                setValue("vehicleId", value, { shouldValidate: true })
              }
              placeholder="Sélectionner un véhicule"
              searchPlaceholder="Plaque, marque…"
              emptyMessage="Aucun véhicule trouvé"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Informations complémentaires…"
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer la réservation"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
