import { FineStatus } from "@prisma/client";
import { CheckCircle2, Circle, Link2, Send, XCircle } from "lucide-react";
import { FineStatusBadge } from "@/components/fines/fine-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { FINE_STATUS_LABELS } from "@/types/enums";

interface FineMatchTimelineProps {
  status: FineStatus;
  createdAt: Date;
  matchedAt: Date | null;
  hasContract: boolean;
  clientName?: string | null;
  contractNumber?: string | null;
}

const STATUS_ORDER: FineStatus[] = [
  FineStatus.NEW,
  FineStatus.MATCHED,
  FineStatus.SENT,
  FineStatus.PAID,
];

function statusIndex(status: FineStatus): number {
  if (status === FineStatus.DISPUTED) return 2;
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function FineMatchTimeline({
  status,
  createdAt,
  matchedAt,
  hasContract,
  clientName,
  contractNumber,
}: FineMatchTimelineProps) {
  const currentIdx = statusIndex(status);
  const isDisputed = status === FineStatus.DISPUTED;

  const steps = [
    {
      key: "created",
      label: "Amende enregistrée",
      detail: formatDateTime(createdAt),
      icon: Circle,
      done: true,
    },
    {
      key: "matched",
      label: hasContract ? "Rapprochement locataire" : "Rapprochement en attente",
      detail: hasContract
        ? `${clientName ?? "Client"}${contractNumber ? ` — contrat ${contractNumber}` : ""}${matchedAt ? ` · ${formatDateTime(matchedAt)}` : ""}`
        : "Aucun contrat lié pour le moment",
      icon: Link2,
      done: hasContract || currentIdx >= 1,
    },
    {
      key: "sent",
      label: FINE_STATUS_LABELS[FineStatus.SENT],
      detail: currentIdx >= 2 && !isDisputed ? "Transmise au locataire" : "—",
      icon: Send,
      done: currentIdx >= 2 && !isDisputed,
    },
    {
      key: "paid",
      label: FINE_STATUS_LABELS[FineStatus.PAID],
      detail: status === FineStatus.PAID ? "Amende réglée" : "—",
      icon: CheckCircle2,
      done: status === FineStatus.PAID,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Historique du rapprochement</CardTitle>
            <CardDescription>
              Suivi du workflow de traitement de l&apos;amende
            </CardDescription>
          </div>
          <FineStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        {isDisputed && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <XCircle className="h-4 w-4 shrink-0" />
            Amende contestée — le rapprochement peut nécessiter une vérification
            manuelle.
          </div>
        )}
        <ol className="relative space-y-6 border-l border-muted pl-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active = step.done;
            return (
              <li key={step.key} className="relative">
                <span
                  className={`absolute -left-[1.85rem] flex h-6 w-6 items-center justify-center rounded-full border bg-background ${
                    active
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p
                  className={`font-medium ${active ? "" : "text-muted-foreground"}`}
                >
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
                {index < steps.length - 1 && !step.done && (
                  <p className="mt-1 text-xs text-muted-foreground">À venir</p>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
