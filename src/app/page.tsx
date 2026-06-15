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
    <div className="relative min-h-screen overflow-hidden">
      <ModernBackground variant="auth" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2 text-white">
          <Car className="h-6 w-6" />
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 pb-12 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Gérez votre parc de location en toute simplicité
          </h1>
          <p className="text-lg text-white/85">
            Clients, véhicules, contrats, états des lieux et amendes — une
            plateforme pensée pour les loueurs professionnels.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
              <Link href={AUTH_ROUTES.login}>Se connecter</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/80 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href={AUTH_ROUTES.register as Route}>S&apos;inscrire</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
