import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { StaffPermission } from "@prisma/client";

export interface NavItem {
  title: string;
  href: "/dashboard" | "/dashboard/clients" | "/dashboard/vehicles" | "/dashboard/contracts" | "/dashboard/inspections" | "/dashboard/fines" | "/dashboard/settings";
  icon: LucideIcon;
  adminOnly?: boolean;
  /** Required for staff (admin always sees all). */
  permission?: StaffPermission | StaffPermission[];
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
    permission: StaffPermission.CLIENTS,
  },
  {
    title: "Véhicules",
    href: "/dashboard/vehicles",
    icon: Car,
    permission: StaffPermission.VEHICLES,
  },
  {
    title: "Contrats",
    href: "/dashboard/contracts",
    icon: FileText,
    permission: StaffPermission.CONTRACTS,
  },
  {
    title: "États des lieux",
    href: "/dashboard/inspections",
    icon: ClipboardCheck,
    permission: [StaffPermission.INSPECTIONS, StaffPermission.CONTRACTS],
  },
  {
    title: "Amendes",
    href: "/dashboard/fines",
    icon: AlertTriangle,
    permission: StaffPermission.FINES,
  },
  {
    title: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
    adminOnly: true,
  },
];

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "LocRent";
