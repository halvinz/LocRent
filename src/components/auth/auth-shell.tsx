import Link from "next/link";
import { Car } from "lucide-react";
import { APP_NAME } from "@/config/navigation";
import { ModernBackground } from "@/components/shared/modern-background";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden">
      <ModernBackground variant="auth" />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 sm:py-5">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Car className="h-6 w-6 shrink-0" />
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
      </header>

      <main className="relative z-10 flex w-full flex-1 flex-col items-stretch justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:items-center sm:px-6">
        <div className="w-full sm:max-w-md">{children}</div>
      </main>
    </div>
  );
}
