"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils";
import { getActiveReservationsAction } from "@/server/actions/reservation.actions";
import type { ActiveReservationItem } from "@/server/services/reservation.service";
import { RESERVATIONS_PATH } from "@/config/navigation";

interface ReservationsSidebarListProps {
  onNavigate?: () => void;
}

function formatContact(phone?: string | null, snapchat?: string | null) {
  if (phone) return phone;
  if (snapchat) return `Snap ${snapchat}`;
  return "—";
}

export function ReservationsSidebarList({
  onNavigate,
}: ReservationsSidebarListProps) {
  const [items, setItems] = useState<ActiveReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const result = await getActiveReservationsAction();
    if (result.success && result.data) {
      setItems(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function handleRefresh() {
      void load();
    }

    window.addEventListener("reservations:updated", handleRefresh);
    return () => window.removeEventListener("reservations:updated", handleRefresh);
  }, [load]);

  return (
    <div className="mt-3 flex min-h-0 flex-1 flex-col border-t border-white/10 pt-3">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-white/50">
        En cours ({loading ? "…" : items.length})
      </p>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
        {loading ? (
          <p className="px-3 py-4 text-sm text-white/50">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="px-3 py-4 text-sm text-white/50">
            Aucune réservation active.
          </p>
        ) : (
          items.map((reservation) => (
            <Link
              key={reservation.id}
              href={`${RESERVATIONS_PATH}#reservation-${reservation.id}`}
              onClick={onNavigate}
              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10"
            >
              <p className="truncate text-sm font-medium text-white">
                {reservation.guestName}
              </p>
              <p className="truncate text-xs text-white/60">
                {formatContact(reservation.phone, reservation.snapchat)}
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/80">
                Acompte {formatMoney(reservation.depositAmount)}
              </p>
              <p className="truncate text-[11px] text-white/45">
                Par {reservation.bookedBy.firstName}{" "}
                {reservation.bookedBy.lastName}
              </p>
            </Link>
          ))
        )}
      </div>

      <Link
        href={`${RESERVATIONS_PATH}/new`}
        onClick={onNavigate}
        className="mt-3 block rounded-xl border border-white/20 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        + Nouvelle réservation
      </Link>
    </div>
  );
}
