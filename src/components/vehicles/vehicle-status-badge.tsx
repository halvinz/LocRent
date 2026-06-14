import { VehicleStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { VEHICLE_STATUS_LABELS } from "@/types/enums";

const STATUS_VARIANT: Record<
  VehicleStatus,
  "success" | "default" | "warning" | "muted" | "destructive"
> = {
  [VehicleStatus.AVAILABLE]: "success",
  [VehicleStatus.RENTED]: "default",
  [VehicleStatus.MAINTENANCE]: "warning",
  [VehicleStatus.UNAVAILABLE]: "muted",
};

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
}

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {VEHICLE_STATUS_LABELS[status]}
    </Badge>
  );
}
