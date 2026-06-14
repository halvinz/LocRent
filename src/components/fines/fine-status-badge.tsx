import { FineStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { FINE_STATUS_LABELS } from "@/types/enums";

const VARIANT: Record<
  FineStatus,
  "muted" | "default" | "success" | "destructive" | "warning"
> = {
  [FineStatus.NEW]: "muted",
  [FineStatus.MATCHED]: "default",
  [FineStatus.SENT]: "warning",
  [FineStatus.PAID]: "success",
  [FineStatus.DISPUTED]: "destructive",
};

export function FineStatusBadge({ status }: { status: FineStatus }) {
  return (
    <Badge variant={VARIANT[status]}>{FINE_STATUS_LABELS[status]}</Badge>
  );
}
