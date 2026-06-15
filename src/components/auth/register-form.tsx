"use client";

import Link from "next/link";
import type { Route } from "next";
import { useFormState, useFormStatus } from "react-dom";
import { Building2, Lock, Mail } from "lucide-react";
import { registerAction } from "@/server/actions/auth.actions";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { AuthCard, AuthField } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-xl text-base font-semibold"
    >
      {pending ? "Création…" : "Créer mon compte"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, null);

  return (
    <AuthCard
      title="Créer votre agence"
      subtitle="1 loueur = 1 agence = 1 compte administrateur"
      footer={
        <div className="text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link
            href={AUTH_ROUTES.login as Route}
            className="font-semibold text-primary hover:underline"
          >
            Se connecter
          </Link>
        </div>
      }
    >
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <AuthField
          id="companyName"
          name="companyName"
          label="Nom de l'agence"
          placeholder="Agence Paris Location"
          autoComplete="organization"
          icon={<Building2 className="h-4 w-4" />}
          error={state?.fieldErrors?.companyName?.[0]}
        />

        <AuthField
          id="email"
          name="email"
          label="Email administrateur"
          type="email"
          placeholder="vous@agence.fr"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          error={state?.fieldErrors?.email?.[0]}
        />

        <AuthField
          id="password"
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="h-4 w-4" />}
          error={state?.fieldErrors?.password?.[0]}
        />

        <p className="text-xs text-slate-500">
          Minimum 8 caractères. Vous serez administrateur de votre agence et
          pourrez inviter des employés ensuite.
        </p>

        <SubmitButton />
      </form>
    </AuthCard>
  );
}
