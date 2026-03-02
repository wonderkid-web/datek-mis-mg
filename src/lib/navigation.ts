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
      { name: "Spesifikasi CCTV", href: "/master-data/cctv" },
      { name: "Asset Categories", href: "/master-data/asset-categories" },
      { name: "ISP", href: "/master-data/isp" },
      { name: "Callout Going & PSTN & Trunk", href: "/master-data/call-outgoing-co-group" },
    ],
  },
  {
    name: "Asset",
    icon: Package,
    children: [
      { name: "Asset Laptop", href: "/items/laptop" },
      { name: "Asset Intel NUC", href: "/items/intel-nuc" },
      { name: "Asset Printer", href: "/items/printer" },
      { name: "Asset CCTV", href: "/items/cctv" },
      { name: "Akun Telepon", href: "/items/akun-telepon" },
    ],
  },
  {
    name: "Data Centre",
    icon: List,
    children: [
      { name: "Data Assets", href: "/data-center/assets" },
      { name: "Assigned Assets", href: "/data-center/assigned-assets" },
      { name: "IP Address Users", href: "/data-center/ip-address" },
    ],
  },
  {
    name: "Service Records",
    icon: ToolCaseIcon,
    children: [
      { name: "History", href: "/service-records/history" },
      {
        name: "Computer Maintenance",
        href: "/service-records/computer-maintenance",
      },
      { name: "Printer Maintenance", href: "/service-records/repetitive" },
      { name: "CCTV Maintenance", href: "/service-records/cctv-maintenance" },
      { name: "ISP Speed Test", href: "/service-records/isp" },
      { name: "Biling Records", href: "/service-records/biling-records" },
      { name: "Problem Sequence", href: "/service-records/problem-sequence" },
    ],
  },
];
