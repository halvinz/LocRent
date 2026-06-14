import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileListCardProps {
  href: Route | string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

export function MobileListCard({
  href,
  title,
  subtitle,
  meta,
  trailing,
  className,
}: MobileListCardProps) {
  return (
    <Link
      href={href as Route}
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40 active:bg-muted/60",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="font-medium leading-snug">{title}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
        {meta && <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2 self-center">
        {trailing}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
