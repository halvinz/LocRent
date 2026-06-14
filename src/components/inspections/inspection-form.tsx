"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { InspectionType } from "@prisma/client";
import { toast } from "sonner";
import {
  INSPECTION_CHECKLIST_ITEMS,
  CHECKLIST_STATUS_OPTIONS,
  type InspectionChecklist,
} from "@/config/inspection";
import { INSPECTION_TYPE_LABELS } from "@/types/enums";
import { inspectionFormSchema } from "@/lib/validations/inspection";
import {
  saveCheckoutAction,
  saveCheckinAction,
} from "@/server/actions/inspection.actions";
import { PhotoUploadList } from "@/components/shared/image-upload-field";
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

type PhotoField = { url: string; caption?: string };

type InspectionFormValues = {
  mileage: string | number;
  fuelLevel: string | number;
  notes?: string;
  damageSummary?: string;
  checklist: InspectionChecklist;
  photos: PhotoField[];
};

interface InspectionFormProps {
  contractId: string;
  type: InspectionType;
  defaultValues?: Partial<InspectionFormValues>;
}

export function InspectionForm({
  contractId,
  type,
  defaultValues,
}: InspectionFormProps) {
  const isCheckout = type === InspectionType.CHECKOUT;
  const saveAction = isCheckout ? saveCheckoutAction : saveCheckinAction;

  const { register, handleSubmit, control, formState: { isSubmitting, errors }, setError } =
    useForm<InspectionFormValues>({
      defaultValues: {
        mileage: defaultValues?.mileage ?? "",
        fuelLevel: defaultValues?.fuelLevel ?? "",
        notes: defaultValues?.notes ?? "",
        damageSummary: defaultValues?.damageSummary ?? "",
        checklist: defaultValues?.checklist ?? {},
        photos: defaultValues?.photos ?? [],
      },
    });

  async function onSubmit(data: InspectionFormValues) {
    const filteredPhotos = data.photos.filter((p) => p.url.trim() !== "");
    const parsed = inspectionFormSchema.safeParse({ ...data, type, photos: filteredPhotos });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) setError(field as keyof InspectionFormValues, { message: issue.message });
      }
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    const result = await saveAction(contractId, data);
    if (!result) return;
    if (result.success) {
      toast.success(`État des lieux ${INSPECTION_TYPE_LABELS[type]} enregistré`);
      return;
    }
    toast.error(result.error ?? "Erreur");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mesures</CardTitle>
          <CardDescription>
            État des lieux — {INSPECTION_TYPE_LABELS[type]}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mileage">Kilométrage *</Label>
            <Input id="mileage" type="number" {...register("mileage", { required: true })} />
            {errors.mileage && <p className="text-sm text-destructive">{errors.mileage.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelLevel">Carburant (%) *</Label>
            <Input id="fuelLevel" type="number" min={0} max={100} {...register("fuelLevel", { required: true })} />
            {errors.fuelLevel && <p className="text-sm text-destructive">{errors.fuelLevel.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {INSPECTION_CHECKLIST_ITEMS.map((item) => (
            <div key={item.key} className="space-y-2">
              <Label>{item.label}</Label>
              <Controller
                name={`checklist.${item.key}` as `checklist.${typeof item.key}`}
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="État" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHECKLIST_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="damageSummary">Résumé des dommages</Label>
            <Textarea id="damageSummary" rows={3} {...register("damageSummary")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Commentaires</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            Joignez plusieurs photos depuis votre ordinateur ou votre téléphone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name="photos"
            control={control}
            render={({ field }) => (
              <PhotoUploadList
                photos={field.value}
                onChange={field.onChange}
                folder="inspections"
              />
            )}
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer l'état des lieux"}
      </Button>
    </form>
  );
}
