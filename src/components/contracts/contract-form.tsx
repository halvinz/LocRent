"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { VehicleStatus } from "@prisma/client";
import { contractFormSchema } from "@/lib/validations/contract";
import { DEFAULT_CONTRACT_TERMS } from "@/config/inspection";
import {
  createContractAndRedirectAction,
  updateContractAndRedirectAction,
} from "@/server/actions/contract.actions";
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
import { VEHICLE_STATUS_LABELS } from "@/types/enums";

type ClientOption = { id: string; firstName: string; lastName: string };
type VehicleOption = {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  currentMileage: number | null;
  status: VehicleStatus;
};

type ContractFormValues = {
  clientId: string;
  vehicleId: string;
  startAt: string;
  expectedEndAt: string;
  dailyPrice?: string | number;
  depositAmount?: string | number;
  includedMileage?: string | number;
  extraMileagePrice?: string | number;
  startMileage?: string | number;
  expectedReturnMileage?: string | number;
  startFuelLevel?: string | number;
  terms?: string;
};

interface ContractFormProps {
  mode: "create" | "edit";
  contractId?: string;
  clients: ClientOption[];
  vehicles: VehicleOption[];
  defaultValues?: Partial<ContractFormValues>;
}

export function ContractForm({
  mode,
  contractId,
  clients,
  vehicles,
  defaultValues,
}: ContractFormProps) {
  const router = useRouter();

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting }, setError } =
    useForm<ContractFormValues>({
      defaultValues: {
        clientId: defaultValues?.clientId ?? "",
        vehicleId: defaultValues?.vehicleId ?? "",
        startAt: defaultValues?.startAt ?? "",
        expectedEndAt: defaultValues?.expectedEndAt ?? "",
        dailyPrice: defaultValues?.dailyPrice ?? "",
        depositAmount: defaultValues?.depositAmount ?? "",
        includedMileage: defaultValues?.includedMileage ?? "",
        extraMileagePrice: defaultValues?.extraMileagePrice ?? "",
        startMileage: defaultValues?.startMileage ?? "",
        expectedReturnMileage: defaultValues?.expectedReturnMileage ?? "",
        startFuelLevel: defaultValues?.startFuelLevel ?? "",
        terms: defaultValues?.terms ?? DEFAULT_CONTRACT_TERMS,
      },
    });

  function onVehicleChange(vehicleId: string) {
    setValue("vehicleId", vehicleId);
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle?.currentMileage != null) {
      setValue("startMileage", vehicle.currentMileage);
    }
  }

  async function onSubmit(data: ContractFormValues) {
    const parsed = contractFormSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) {
          setError(field as keyof ContractFormValues, { message: issue.message });
        }
      }
      const firstMessage =
        parsed.error.issues[0]?.message ?? "Veuillez corriger les erreurs";
      toast.error(firstMessage);
      return;
    }

    const result =
      mode === "create"
        ? await createContractAndRedirectAction(data)
        : await updateContractAndRedirectAction(contractId!, data);

    // redirect() ne renvoie pas de valeur côté client — le contrat est déjà créé
    if (!result) return;

    if (result.success) {
      toast.success(mode === "create" ? "Contrat créé" : "Contrat mis à jour");
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages[0]) setError(field as keyof ContractFormValues, { message: messages[0] });
      }
    }
    toast.error(result.error ?? "Erreur");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Client *</Label>
            <Controller
              name="clientId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.lastName} {c.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Véhicule *</Label>
            <Controller
              name="vehicleId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(v) => {
                    field.onChange(v);
                    onVehicleChange(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.licensePlate} — {v.make} {v.model} ({VEHICLE_STATUS_LABELS[v.status]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleId && <p className="text-sm text-destructive">{errors.vehicleId.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Période</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startAt">Début *</Label>
            <Controller
              name="startAt"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={
                    typeof field.value === "string"
                      ? field.value
                      : toDatetimeLocalValue(field.value as Date | string)
                  }
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
            {errors.startAt && <p className="text-sm text-destructive">{errors.startAt.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedEndAt">Fin prévue *</Label>
            <Controller
              name="expectedEndAt"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="expectedEndAt"
                  type="datetime-local"
                  value={
                    typeof field.value === "string"
                      ? field.value
                      : toDatetimeLocalValue(field.value as Date | string)
                  }
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
            {errors.expectedEndAt && <p className="text-sm text-destructive">{errors.expectedEndAt.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tarification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dailyPrice">Prix journalier (€)</Label>
            <Input id="dailyPrice" type="number" step="0.01" min={0} {...register("dailyPrice")} />
            {errors.dailyPrice && (
              <p className="text-sm text-destructive">{errors.dailyPrice.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="depositAmount">Caution (€)</Label>
            <Input id="depositAmount" type="number" step="0.01" min={0} {...register("depositAmount")} />
            {errors.depositAmount && (
              <p className="text-sm text-destructive">{errors.depositAmount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="includedMileage">Km inclus</Label>
            <Input id="includedMileage" type="number" min={0} {...register("includedMileage")} />
            {errors.includedMileage && (
              <p className="text-sm text-destructive">{errors.includedMileage.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="extraMileagePrice">Prix km supp. (€)</Label>
            <Input id="extraMileagePrice" type="number" step="0.01" min={0} {...register("extraMileagePrice")} />
            {errors.extraMileagePrice && (
              <p className="text-sm text-destructive">{errors.extraMileagePrice.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Départ prévu</CardTitle>
          <CardDescription>Kilométrage et carburant au départ</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startMileage">Kilométrage départ</Label>
            <Input id="startMileage" type="number" min={0} {...register("startMileage")} />
            {errors.startMileage && (
              <p className="text-sm text-destructive">{errors.startMileage.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedReturnMileage">Km retour prévu</Label>
            <Input id="expectedReturnMileage" type="number" min={0} {...register("expectedReturnMileage")} />
            {errors.expectedReturnMileage && (
              <p className="text-sm text-destructive">{errors.expectedReturnMileage.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="startFuelLevel">Carburant (%)</Label>
            <Input id="startFuelLevel" type="number" min={0} max={100} {...register("startFuelLevel")} />
            {errors.startFuelLevel && (
              <p className="text-sm text-destructive">{errors.startFuelLevel.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clauses</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={6} {...register("terms")} />
          {errors.terms && (
            <p className="mt-2 text-sm text-destructive">{errors.terms.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : mode === "create" ? "Créer le brouillon" : "Enregistrer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export function toDatetimeLocalValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
