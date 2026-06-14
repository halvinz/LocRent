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

export interface NavItem {
  title: string;
  href: "/dashboard" | "/dashboard/clients" | "/dashboard/vehicles" | "/dashboard/contracts" | "/dashboard/inspections" | "/dashboard/fines" | "/dashboard/settings";
  icon: LucideIcon;
  adminOnly?: boolean;
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
  },
  {
    title: "Véhicules",
    href: "/dashboard/vehicles",
    icon: Car,
  },
  {
    title: "Contrats",
    href: "/dashboard/contracts",
    icon: FileText,
  },
  {
    title: "États des lieux",
    href: "/dashboard/inspections",
    icon: ClipboardCheck,
  },
  {
    title: "Amendes",
    href: "/dashboard/fines",
    icon: AlertTriangle,
  },
  {
    title: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
    adminOnly: true,
  },
];

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "FleetRent";
