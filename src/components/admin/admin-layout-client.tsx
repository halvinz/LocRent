"use client";

import { useCallback, useState } from "react";
import type { StaffPermission, UserRole } from "@prisma/client";
import { ModernBackground } from "@/components/shared/modern-background";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { AdminMobileNav } from "./admin-mobile-nav";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    permissions: StaffPermission[];
  };
  companyName: string;
}

export function AdminLayoutClient({
  children,
  user,
  companyName,
}: AdminLayoutClientProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="relative flex min-h-dvh w-full max-w-[100vw] overflow-x-hidden">
      <AdminSidebar
        userRole={user.role}
        permissions={user.permissions}
        companyName={companyName}
      />
      <AdminMobileNav
        open={mobileNavOpen}
        onClose={closeMobileNav}
        userRole={user.role}
        permissions={user.permissions}
        companyName={companyName}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <ModernBackground variant="admin" />
        <AdminTopbar
          user={user}
          companyName={companyName}
          mobileNavOpen={mobileNavOpen}
          onMenuClick={() => setMobileNavOpen((prev) => !prev)}
        />
        <main className="relative z-10 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
