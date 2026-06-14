"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

export function Pagination({ page, totalPages, total }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        {total} résultat{total > 1 ? "s" : ""} — page {page} / {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={page <= 1}
          className={cn("flex-1 sm:flex-none", page <= 1 && "pointer-events-none opacity-50")}
        >
          <Link href={buildHref(page - 1) as Route}>
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            Précédent
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={page >= totalPages}
          className={cn(
            "flex-1 sm:flex-none",
            page >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          <Link href={buildHref(page + 1) as Route}>
            Suivant
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
