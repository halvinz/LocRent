import { RentalContractStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { RENTAL_CONTRACT_STATUS_LABELS } from "@/types/enums";

const VARIANT: Record<
  RentalContractStatus,
  "muted" | "default" | "success" | "destructive"
> = {
  [RentalContractStatus.DRAFT]: "muted",
  [RentalContractStatus.ACTIVE]: "default",
  [RentalContractStatus.COMPLETED]: "success",
  [RentalContractStatus.CANCELLED]: "destructive",
};

export function ContractStatusBadge({
  status,
}: {
  status: RentalContractStatus;
}) {
  return (
    <Badge variant={VARIANT[status]}>
      {RENTAL_CONTRACT_STATUS_LABELS[status]}
    </Badge>
  );
}
