import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { StaffPermission } from "@prisma/client";
import { guardPermission } from "@/lib/tenant/page-guard";
import { listAllActiveReservations } from "@/server/services/reservation.service";
import { SearchBar } from "@/components/shared/search-bar";
import { ReservationActions } from "@/components/reservations/reservation-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableScroll } from "@/components/shared/data-table-scroll";
import { formatDateTime, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Réservations" };

interface ReservationsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function formatContact(phone?: string | null, snapchat?: string | null) {
  if (phone) return `Tél. ${phone}`;
  if (snapchat) return `Snap ${snapchat}`;
  return "—";
}

function formatBookedBy(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`;
}

export default async function ReservationsPage({
  searchParams,
}: ReservationsPageProps) {
  const { companyId } = await guardPermission(StaffPermission.RESERVATIONS);
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const items = await listAllActiveReservations(companyId, q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Réservations en cours
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {items.length} réservation{items.length !== 1 ? "s" : ""} en cours
          </p>
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/dashboard/reservations/new">Nouvelle réservation</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 pt-6 sm:p-6">
          <div className="mb-4 lg:hidden">
            <Suspense
              fallback={
                <div className="h-10 max-w-sm flex-1 animate-pulse rounded-md bg-muted" />
              }
            >
              <SearchBar placeholder="Rechercher une réservation…" />
            </Suspense>
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucune réservation active pour le moment.
              <div className="mt-4">
                <Button asChild>
                  <Link href="/dashboard/reservations/new">
                    Créer une réservation
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {items.map((reservation) => (
                  <div
                    key={reservation.id}
                    id={`reservation-${reservation.id}`}
                    className="scroll-mt-24 flex items-start gap-3 rounded-lg border bg-card p-4"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="font-medium leading-snug">
                        {reservation.guestName}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          Pris par{" "}
                          <span className="text-foreground">
                            {formatBookedBy(reservation.bookedBy)}
                          </span>
                        </p>
                        <p>
                          {formatContact(
                            reservation.phone,
                            reservation.snapchat,
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          Acompte {formatMoney(reservation.depositAmount)}
                        </Badge>
                        {reservation.vehicle && (
                          <span className="text-xs text-muted-foreground">
                            {reservation.vehicle.licensePlate}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(reservation.createdAt)}
                        </span>
                      </div>
                    </div>
                    <ReservationActions
                      reservationId={reservation.id}
                      guestName={reservation.guestName}
                    />
                  </div>
                ))}
              </div>

              <div className="hidden lg:block">
                <DataTableScroll>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pour qui</TableHead>
                        <TableHead>Pris par</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Acompte</TableHead>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[60px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((reservation) => (
                        <TableRow
                          key={reservation.id}
                          id={`reservation-${reservation.id}`}
                          className="scroll-mt-24"
                        >
                          <TableCell className="font-medium">
                            {reservation.guestName}
                          </TableCell>
                          <TableCell>
                            {formatBookedBy(reservation.bookedBy)}
                          </TableCell>
                          <TableCell>
                            {formatContact(
                              reservation.phone,
                              reservation.snapchat,
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatMoney(reservation.depositAmount)}
                          </TableCell>
                          <TableCell>
                            {reservation.vehicle
                              ? `${reservation.vehicle.licensePlate} — ${reservation.vehicle.make} ${reservation.vehicle.model}`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(reservation.createdAt)}
                          </TableCell>
                          <TableCell>
                            <ReservationActions
                              reservationId={reservation.id}
                              guestName={reservation.guestName}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DataTableScroll>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
