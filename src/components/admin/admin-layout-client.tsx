"use client";

import { useCallback, useState } from "react";
import type { UserRole } from "@prisma/client";
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
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar userRole={user.role} companyName={companyName} />
      <AdminMobileNav
        open={mobileNavOpen}
        onClose={closeMobileNav}
        userRole={user.role}
        companyName={companyName}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          user={user}
          companyName={companyName}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
