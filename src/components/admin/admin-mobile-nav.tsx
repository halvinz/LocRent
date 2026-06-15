"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { StaffPermission, UserRole } from "@prisma/client";
import { X, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, isReservationsFocusedPath } from "@/config/navigation";
import { AdminNavLinks } from "./admin-nav-links";
import { ReservationsBackLink } from "./reservations-back-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminMobileNavProps {
  open: boolean;
  onClose: () => void;
  userRole: UserRole;
  permissions: StaffPermission[];
  companyName: string;
}

export function AdminMobileNav({
  open,
  onClose,
  userRole,
  permissions,
  companyName,
}: AdminMobileNavProps) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const focusedReservations = isReservationsFocusedPath(pathname);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
          "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw,20rem)] max-w-[85vw] flex-col overflow-hidden border-r border-[#1e3a5f]/30 bg-[#0c2340] text-white shadow-2xl transition-transform duration-200 ease-out sm:max-w-xs lg:hidden",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
        aria-hidden={!open}
        aria-modal={open}
        role="dialog"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/20 via-transparent to-slate-950/40" />
        <div className="relative flex min-h-[3.5rem] items-center justify-between gap-2 border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f]">
              <Car className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {focusedReservations ? "Réservations" : APP_NAME}
              </span>
              <span className="block truncate text-xs text-white/65">
                {companyName}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 text-white hover:bg-white/10"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {focusedReservations && (
          <div className="relative border-b border-white/10 px-3 py-3">
            <ReservationsBackLink onNavigate={onClose} />
          </div>
        )}

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <AdminNavLinks
            userRole={userRole}
            permissions={permissions}
            onNavigate={onClose}
            className="min-h-full"
          />
        </div>

        <Separator className="relative bg-white/10" />
        <div className="relative p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {focusedReservations ? (
            <ReservationsBackLink onNavigate={onClose} />
          ) : (
            <p className="text-xs text-white/45">
              Multi-tenant · {companyName}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
