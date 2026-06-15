"use client";

import { StaffPermission } from "@prisma/client";
import { PERMISSION_META } from "@/config/permissions";
import { Label } from "@/components/ui/label";

interface PermissionCheckboxesProps {
  value: StaffPermission[];
  onChange: (permissions: StaffPermission[]) => void;
  disabled?: boolean;
}

export function PermissionCheckboxes({
  value,
  onChange,
  disabled,
}: PermissionCheckboxesProps) {
  function toggle(permission: StaffPermission) {
    if (disabled) return;
    if (value.includes(permission)) {
      onChange(value.filter((p) => p !== permission));
    } else {
      onChange([...value, permission]);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.values(StaffPermission).map((permission) => {
        const meta = PERMISSION_META[permission];
        const checked = value.includes(permission);
        return (
          <label
            key={permission}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              checked ? "border-primary bg-primary/5" : "hover:bg-muted/40"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(permission)}
            />
            <div>
              <span className="text-sm font-medium">{meta.label}</span>
              <p className="text-xs text-muted-foreground">{meta.description}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
