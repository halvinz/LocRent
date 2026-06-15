"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StaffPermission, UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { hasAnyPermission } from "@/lib/permissions";
import { ADMIN_NAV_ITEMS } from "@/config/navigation";

interface AdminNavLinksProps {
  userRole: UserRole;
  permissions: StaffPermission[];
  onNavigate?: () => void;
  className?: string;
}

export function AdminNavLinks({
  userRole,
  permissions,
  onNavigate,
  className,
}: AdminNavLinksProps) {
  const pathname = usePathname();

  const navItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.adminOnly && userRole !== UserRole.ADMIN) return false;
    if (userRole === UserRole.ADMIN) return true;
    if (!item.permission) return true;
    const required = Array.isArray(item.permission)
      ? item.permission
      : [item.permission];
    return hasAnyPermission({ role: userRole, permissions }, required);
  });

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
