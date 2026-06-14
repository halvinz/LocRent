"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  paramName?: string;
}

export function SearchBar({
  placeholder = "Rechercher…",
  paramName = "q",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValue = searchParams.get(paramName) ?? "";

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(paramName, value);
      } else {
        params.delete(paramName);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}` as Route);
      });
    },
    [router, pathname, searchParams, paramName],
  );

  return (
    <div className="relative max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        defaultValue={currentValue}
        className="pl-9"
        onChange={(e) => handleSearch(e.target.value)}
        disabled={isPending}
      />
    </div>
  );
}
