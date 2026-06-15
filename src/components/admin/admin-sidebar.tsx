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
    <aside className="relative z-20 hidden w-64 shrink-0 flex-col overflow-hidden border-r border-[#1e3a5f]/30 bg-[#0c2340] text-sidebar-foreground lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/20 via-transparent to-slate-950/40" />
      <div className="relative flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg shadow-black/20">
          <Car className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex flex-col">
          <span className="truncate text-sm font-semibold text-white">
            {APP_NAME}
          </span>
          <span className="truncate text-xs text-white/65">{companyName}</span>
        </div>
      </div>

      <ScrollArea className="relative flex-1 px-3 py-4">
        <AdminNavLinks userRole={userRole} permissions={permissions} />
      </ScrollArea>

      <Separator className="relative bg-white/10" />
      <div className="relative p-4">
        <p className="truncate text-xs text-white/45">
          Multi-tenant · {companyName}
        </p>
      </div>
    </aside>
  );
}
