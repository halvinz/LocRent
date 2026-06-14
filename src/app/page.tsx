import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, AUTH_ROUTES } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/navigation";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect(AUTH_ROUTES.dashboard);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {APP_NAME}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Gérez vos clients, véhicules, contrats et amendes — tout en un seul
          endroit.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
