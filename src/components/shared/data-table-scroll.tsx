import { cn } from "@/lib/utils";

interface DataTableScrollProps {
  children: React.ReactNode;
  className?: string;
}

/** Horizontal scroll wrapper for wide tables on small screens. */
export function DataTableScroll({ children, className }: DataTableScrollProps) {
  return (
    <div className={cn("-mx-4 overflow-x-auto sm:mx-0", className)}>
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}
