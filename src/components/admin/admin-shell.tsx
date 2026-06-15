import type { StaffPermission, UserRole } from "@prisma/client";
import { AdminLayoutClient } from "./admin-layout-client";

interface AdminShellProps {
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

export function AdminShell({
  children,
  user,
  companyName,
}: AdminShellProps) {
  return (
    <AdminLayoutClient user={user} companyName={companyName}>
      {children}
    </AdminLayoutClient>
  );
}
