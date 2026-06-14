"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, APP_NAME } from "@/config/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  userRole: UserRole;
  companyName: string;
}

export function AdminSidebar({ userRole, companyName }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.adminOnly || userRole === UserRole.ADMIN,
  );

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Car className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{APP_NAME}</span>
          <span className="truncate text-xs text-sidebar-foreground/70">
            {companyName}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
      <div className="p-4">
        <p className="text-xs text-sidebar-foreground/50">
          Multi-tenant · {companyName}
        </p>
      </div>
    </aside>
  );
}
