"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import { X, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/config/navigation";
import { AdminNavLinks } from "./admin-nav-links";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminMobileNavProps {
  open: boolean;
  onClose: () => void;
  userRole: UserRole;
  companyName: string;
}

export function AdminMobileNav({
  open,
  onClose,
  userRole,
  companyName,
}: AdminMobileNavProps) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Fermer uniquement quand la route change (pas à l'ouverture du menu)
  useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] flex-col border-r bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
        aria-hidden={!open}
        aria-modal={open}
        role="dialog"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Car className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold">{APP_NAME}</span>
              <span className="block truncate text-xs text-sidebar-foreground/70">
                {companyName}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNavLinks userRole={userRole} onNavigate={onClose} />
        </div>

        <Separator className="bg-sidebar-border" />
        <div className="p-4">
          <p className="text-xs text-sidebar-foreground/50">
            Multi-tenant · {companyName}
          </p>
        </div>
      </aside>
    </>
  );
}
