import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "États des lieux" };

export default function InspectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">États des lieux</h2>
        <p className="text-muted-foreground">
          Prise en charge et restitution — module à venir
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>En construction</CardTitle>
          <CardDescription>
            Inspections CHECK_IN / CHECK_OUT avec photos.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
