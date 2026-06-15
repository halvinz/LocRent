import Link from "next/link";
import { Car } from "lucide-react";
import { APP_NAME } from "@/config/navigation";
import { ModernBackground } from "@/components/shared/modern-background";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ModernBackground variant="auth" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Car className="h-6 w-6" />
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pb-10">
        {children}
      </main>
    </div>
  );
}
