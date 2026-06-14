import { InspectionType } from "@prisma/client";
import {
  INSPECTION_CHECKLIST_ITEMS,
  CHECKLIST_STATUS_OPTIONS,
  type InspectionChecklist,
} from "@/config/inspection";
import { INSPECTION_TYPE_LABELS } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type InspectionData = {
  type: InspectionType;
  mileage: number | null;
  fuelLevel: number | null;
  notes: string | null;
  damageSummary: string | null;
  checklist: unknown;
  photos: { url: string; caption: string | null }[];
};

interface InspectionComparisonProps {
  checkout: InspectionData | null;
  checkin: InspectionData | null;
}

function checklistLabel(value: string | undefined) {
  return CHECKLIST_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

function renderChecklist(checklist: unknown) {
  const data = (checklist ?? {}) as InspectionChecklist;
  return (
    <ul className="space-y-1 text-sm">
      {INSPECTION_CHECKLIST_ITEMS.map((item) => (
        <li key={item.key} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{item.label}</span>
          <span>{checklistLabel(data[item.key])}</span>
        </li>
      ))}
    </ul>
  );
}

function DiffRow({
  label,
  checkout,
  checkin,
}: {
  label: string;
  checkout: string;
  checkin: string;
}) {
  const changed = checkout !== checkin && checkin !== "—";
  return (
    <div className="grid grid-cols-3 gap-2 border-b py-2 text-sm last:border-0">
      <span className="font-medium">{label}</span>
      <span>{checkout}</span>
      <span className={changed ? "font-semibold text-amber-700" : ""}>{checkin}</span>
    </div>
  );
}

export function InspectionComparison({
  checkout,
  checkin,
}: InspectionComparisonProps) {
  if (!checkout && !checkin) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun état des lieux enregistré pour ce contrat.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {[checkout, checkin].map((inspection, i) => {
          const type = i === 0 ? InspectionType.CHECKOUT : InspectionType.CHECKIN;
          const label = INSPECTION_TYPE_LABELS[type];
          if (!inspection) {
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="text-base">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Non renseigné</p>
                </CardContent>
              </Card>
            );
          }
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Km</span>
                    <p className="font-medium">{inspection.mileage?.toLocaleString("fr-FR") ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carburant</span>
                    <p className="font-medium">
                      {inspection.fuelLevel != null ? `${inspection.fuelLevel} %` : "—"}
                    </p>
                  </div>
                </div>
                {renderChecklist(inspection.checklist)}
                {inspection.damageSummary && (
                  <div>
                    <span className="text-muted-foreground">Dommages</span>
                    <p>{inspection.damageSummary}</p>
                  </div>
                )}
                {inspection.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {inspection.photos.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {p.caption ?? `Photo ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {checkout && checkin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Différences départ → retour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
              <span>Mesure</span>
              <span>Départ</span>
              <span>Retour</span>
            </div>
            <DiffRow
              label="Kilométrage"
              checkout={checkout.mileage?.toLocaleString("fr-FR") ?? "—"}
              checkin={checkin.mileage?.toLocaleString("fr-FR") ?? "—"}
            />
            <DiffRow
              label="Carburant"
              checkout={checkout.fuelLevel != null ? `${checkout.fuelLevel} %` : "—"}
              checkin={checkin.fuelLevel != null ? `${checkin.fuelLevel} %` : "—"}
            />
            {INSPECTION_CHECKLIST_ITEMS.map((item) => {
              const co = (checkout.checklist as InspectionChecklist)?.[item.key];
              const ci = (checkin.checklist as InspectionChecklist)?.[item.key];
              return (
                <DiffRow
                  key={item.key}
                  label={item.label}
                  checkout={checklistLabel(co)}
                  checkin={checklistLabel(ci)}
                />
              );
            })}
            {(checkout.mileage != null && checkin.mileage != null) && (
              <div className="mt-4">
                <Badge variant="secondary">
                  +{(checkin.mileage - checkout.mileage).toLocaleString("fr-FR")} km parcourus
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
