import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: Route;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
