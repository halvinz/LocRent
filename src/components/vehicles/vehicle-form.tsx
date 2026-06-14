"use client";

import { useRouter } from "next/navigation";
import { VehicleStatus } from "@prisma/client";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  vehicleFormSchema,
} from "@/lib/validations/vehicle";
import { FUEL_TYPES, TRANSMISSION_TYPES } from "@/config/constants";
import { formatDateForInput } from "@/lib/utils";
import { VEHICLE_STATUS_LABELS } from "@/types/enums";
import {
  createVehicleAndRedirectAction,
  updateVehicleAndRedirectAction,
} from "@/server/actions/vehicle.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VehicleFormValues = {
  licensePlate: string;
  make: string;
  model: string;
  trim?: string;
  year?: string | number;
  vin?: string;
  currentMileage?: string | number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  status: VehicleStatus;
  registrationExpiry?: string;
  insuranceExpiry?: string;
  notes?: string;
};

interface VehicleFormProps {
  mode: "create" | "edit";
  vehicleId?: string;
  defaultValues?: Partial<VehicleFormValues>;
}

function toFormDefaults(values?: Partial<VehicleFormValues>): VehicleFormValues {
  return {
    licensePlate: values?.licensePlate ?? "",
    make: values?.make ?? "",
    model: values?.model ?? "",
    trim: values?.trim ?? "",
    year: values?.year ?? "",
    vin: values?.vin ?? "",
    currentMileage: values?.currentMileage ?? "",
    fuelType: values?.fuelType ?? "",
    transmission: values?.transmission ?? "",
    color: values?.color ?? "",
    status: values?.status ?? VehicleStatus.AVAILABLE,
    registrationExpiry: formatDateForInput(values?.registrationExpiry as string | Date | undefined),
    insuranceExpiry: formatDateForInput(values?.insuranceExpiry as string | Date | undefined),
    notes: values?.notes ?? "",
  };
}

export function VehicleForm({ mode, vehicleId, defaultValues }: VehicleFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<VehicleFormValues>({
    defaultValues: toFormDefaults(defaultValues),
  });

  async function onSubmit(data: VehicleFormValues) {
    const parsed = vehicleFormSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) {
          setError(field as keyof VehicleFormValues, { message: issue.message });
        }
      }
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    const result =
      mode === "create"
        ? await createVehicleAndRedirectAction(parsed.data)
        : await updateVehicleAndRedirectAction(vehicleId!, parsed.data);

    if (result.success) {
      toast.success(
        mode === "create" ? "Véhicule créé avec succès" : "Véhicule mis à jour",
      );
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages[0]) {
          setError(field as keyof VehicleFormValues, { message: messages[0] });
        }
      }
    }

    toast.error(result.error ?? "Une erreur est survenue");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identification</CardTitle>
          <CardDescription>Plaque, marque et modèle</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="licensePlate">Plaque *</Label>
            <Input id="licensePlate" {...register("licensePlate")} className="uppercase" />
            {errors.licensePlate && (
              <p className="text-sm text-destructive">{errors.licensePlate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(VehicleStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {VEHICLE_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="make">Marque *</Label>
            <Input id="make" {...register("make")} />
            {errors.make && (
              <p className="text-sm text-destructive">{errors.make.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modèle *</Label>
            <Input id="model" {...register("model")} />
            {errors.model && (
              <p className="text-sm text-destructive">{errors.model.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="trim">Finition</Label>
            <Input id="trim" {...register("trim")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Année</Label>
            <Input id="year" type="number" {...register("year")} />
            {errors.year && (
              <p className="text-sm text-destructive">{errors.year.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vin">VIN</Label>
            <Input id="vin" {...register("vin")} className="uppercase" maxLength={17} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currentMileage">Kilométrage</Label>
            <Input id="currentMileage" type="number" {...register("currentMileage")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Couleur</Label>
            <Input id="color" {...register("color")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelType">Carburant</Label>
            <Controller
              name="fuelType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Controller
              name="transmission"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationExpiry">Expiration carte grise</Label>
            <Input id="registrationExpiry" type="date" {...register("registrationExpiry")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuranceExpiry">Expiration assurance</Label>
            <Input id="insuranceExpiry" type="date" {...register("insuranceExpiry")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={4} {...register("notes")} placeholder="Notes internes…" />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Enregistrement…"
            : mode === "create"
              ? "Créer le véhicule"
              : "Enregistrer"}
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
