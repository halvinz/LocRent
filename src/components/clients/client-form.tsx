"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  clientFormSchema,
} from "@/lib/validations/client";
import { formatDateForInput } from "@/lib/utils";
import {
  createClientAndRedirectAction,
  updateClientAndRedirectAction,
} from "@/server/actions/client.actions";
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

interface ClientFormProps {
  mode: "create" | "edit";
  clientId?: string;
  defaultValues?: Partial<ClientFormValues>;
}

type ClientFormValues = {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  drivingLicenseNumber?: string;
  drivingLicenseIssuedAt?: string;
  drivingLicenseExpiryAt?: string;
  drivingLicenseFrontUrl?: string;
  drivingLicenseBackUrl?: string;
  notes?: string;
};

function toFormDefaults(values?: Partial<ClientFormValues>): ClientFormValues {
  return {
    firstName: values?.firstName ?? "",
    lastName: values?.lastName ?? "",
    phone: values?.phone ?? "",
    email: values?.email ?? "",
    address: values?.address ?? "",
    drivingLicenseNumber: values?.drivingLicenseNumber ?? "",
    drivingLicenseIssuedAt: formatDateForInput(
      values?.drivingLicenseIssuedAt as Date | undefined,
    ),
    drivingLicenseExpiryAt: formatDateForInput(
      values?.drivingLicenseExpiryAt as Date | undefined,
    ),
    drivingLicenseFrontUrl: values?.drivingLicenseFrontUrl ?? "",
    drivingLicenseBackUrl: values?.drivingLicenseBackUrl ?? "",
    notes: values?.notes ?? "",
  };
}

export function ClientForm({ mode, clientId, defaultValues }: ClientFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ClientFormValues>({
    defaultValues: toFormDefaults(defaultValues),
  });

  async function onSubmit(data: ClientFormValues) {
    const parsed = clientFormSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) {
          setError(field as keyof ClientFormValues, { message: issue.message });
        }
      }
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    const result =
      mode === "create"
        ? await createClientAndRedirectAction(parsed.data)
        : await updateClientAndRedirectAction(clientId!, parsed.data);

    if (!result) return;

    if (result.success) {
      toast.success(
        mode === "create" ? "Client créé avec succès" : "Client mis à jour",
      );
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages[0]) {
          setError(field as keyof ClientFormValues, { message: messages[0] });
        }
      }
    }

    toast.error(result.error ?? "Une erreur est survenue");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription>Informations personnelles du client</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" {...register("address")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permis de conduire</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="drivingLicenseNumber">Numéro de permis</Label>
            <Input id="drivingLicenseNumber" {...register("drivingLicenseNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drivingLicenseIssuedAt">Date de délivrance</Label>
            <Input id="drivingLicenseIssuedAt" type="date" {...register("drivingLicenseIssuedAt")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drivingLicenseExpiryAt">Date d&apos;expiration</Label>
            <Input id="drivingLicenseExpiryAt" type="date" {...register("drivingLicenseExpiryAt")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drivingLicenseFrontUrl">URL permis (recto)</Label>
            <Input id="drivingLicenseFrontUrl" {...register("drivingLicenseFrontUrl")} />
            {errors.drivingLicenseFrontUrl && (
              <p className="text-sm text-destructive">{errors.drivingLicenseFrontUrl.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="drivingLicenseBackUrl">URL permis (verso)</Label>
            <Input id="drivingLicenseBackUrl" {...register("drivingLicenseBackUrl")} />
            {errors.drivingLicenseBackUrl && (
              <p className="text-sm text-destructive">{errors.drivingLicenseBackUrl.message}</p>
            )}
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
              ? "Créer le client"
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
