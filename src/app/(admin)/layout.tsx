import { redirect } from "next/navigation";
import { getSession, AUTH_ROUTES } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect(AUTH_ROUTES.login);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      company: { select: { name: true } },
    },
  });

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <AdminShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }}
      companyName={user.company.name}
    >
      {children}
      <Toaster />
    </AdminShell>
  );
}
