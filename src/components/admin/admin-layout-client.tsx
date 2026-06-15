"use client";

import { useCallback, useState } from "react";
import type { StaffPermission, UserRole } from "@prisma/client";
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
    <div className="flex min-h-screen bg-slate-50">
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
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          user={user}
          companyName={companyName}
          mobileNavOpen={mobileNavOpen}
          onMenuClick={() => setMobileNavOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
