import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Car } from "lucide-react";
import { getSession, AUTH_ROUTES } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/navigation";
import { ModernBackground } from "@/components/shared/modern-background";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect(AUTH_ROUTES.dashboard);
  }

  return (
    <div className="relative flex min-h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden">
      <ModernBackground variant="auth" />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 sm:py-5">
        <div className="flex items-center gap-2 text-white">
          <Car className="h-6 w-6 shrink-0" />
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 pb-[max(3rem,env(safe-area-inset-bottom))] text-center">
        <div className="w-full max-w-2xl space-y-5 sm:space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Gérez votre parc de location en toute simplicité
          </h1>
          <p className="text-base text-white/85 sm:text-lg">
            Clients, véhicules, contrats, états des lieux et amendes — une
            plateforme pensée pour les loueurs professionnels.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 w-full px-8 text-base font-semibold sm:w-auto"
            >
              <Link href={AUTH_ROUTES.login}>Se connecter</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-xl border-white/80 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
            >
              <Link href={AUTH_ROUTES.register as Route}>S&apos;inscrire</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
