import type { UserRole } from "@prisma/client";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface AdminShellProps {
  children: React.ReactNode;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  companyName: string;
}

export function AdminShell({
  children,
  user,
  companyName,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar userRole={user.role} companyName={companyName} />
      <div className="flex flex-1 flex-col">
        <AdminTopbar user={user} companyName={companyName} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
