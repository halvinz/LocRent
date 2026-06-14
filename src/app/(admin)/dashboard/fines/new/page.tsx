import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FineForm } from "@/components/fines/fine-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Nouvelle amende" };

export default function NewFinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/fines">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nouvelle amende</h2>
          <p className="text-muted-foreground">
            Saisissez l&apos;infraction et identifiez le locataire responsable
          </p>
        </div>
      </div>
      <FineForm />
    </div>
  );
}
