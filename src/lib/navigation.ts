import {
  Home,
  Package,
  User,
  List,
  ToolCaseIcon,
  Database,
  LayoutGrid,
} from "lucide-react";

interface ChildNavigationItem {
  name: string;
  href: string;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any; // LucideIcon component
  children?: ChildNavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  // {
  //   name: "Home",
  //   href: "/",
  //   icon: Home,
  // },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    name: "Employee",
    href: "/employee",
    icon: User,
  },
  {
    name: "Master Data",
    icon: Database,
    children: [
      { name: "Spesifikasi Laptop/Intel NUC", href: "/master-data/laptop" },
      { name: "Spesifikasi Printer", href: "/master-data/printer" },
      { name: "Asset Categories", href: "/master-data/asset-categories" },
    ],
  },
  {
    name: "Asset",
    icon: Package,
    children: [
      { name: "Asset Laptop", href: "/items/laptop" },
      { name: "Asset Intel NUC", href: "/items/intel-nuc" },
      { name: "Asset Printer", href: "/items/printer" },
    ],
  },
  {
    name: "Data Centre",
    icon: List,
    children: [
      { name: "Data Assets", href: "/data-center/assets" },
      { name: "Assigned Assets", href: "/data-center/assigned-assets" },
    ],
  },
  {
    name: "Service Record",
    href: "/service-records/history",
    icon: ToolCaseIcon,
  },
];