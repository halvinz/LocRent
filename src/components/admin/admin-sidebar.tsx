"use client";

import { Car } from "lucide-react";
import { StaffPermission, UserRole } from "@prisma/client";
import { APP_NAME } from "@/config/navigation";
import { AdminNavLinks } from "./admin-nav-links";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  userRole: UserRole;
  permissions: StaffPermission[];
  companyName: string;
}

export function AdminSidebar({
  userRole,
  permissions,
  companyName,
}: AdminSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Car className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div className="min-w-0 flex flex-col">
          <span className="truncate text-sm font-semibold">{APP_NAME}</span>
          <span className="truncate text-xs text-sidebar-foreground/70">
            {companyName}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <AdminNavLinks userRole={userRole} permissions={permissions} />
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
      <div className="p-4">
        <p className="truncate text-xs text-sidebar-foreground/50">
          Multi-tenant · {companyName}
        </p>
      </div>
    </aside>
  );
}
