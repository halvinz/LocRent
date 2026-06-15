"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservationsBackLinkProps {
  onNavigate?: () => void;
  className?: string;
  variant?: "sidebar" | "bar" | "inline";
}

export function ReservationsBackLink({
  onNavigate,
  className,
  variant = "sidebar",
}: ReservationsBackLinkProps) {
  if (variant === "bar") {
    return (
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={cn(
          "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-foreground transition-colors hover:bg-accent lg:hidden",
          className,
        )}
      >
        <ArrowLeft className="h-5 w-5 shrink-0" />
        <span>Menu</span>
      </Link>
    );
  }

  if (variant === "inline") {
    return (
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-white/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent lg:hidden",
          className,
        )}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Retour au menu principal
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      Menu principal
    </Link>
  );
}
