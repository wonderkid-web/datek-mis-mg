"use client";

import Link from "next/link";
import {
  Home,
  Package,
  ChevronLeft,
  LogOut,
  User,
  List,
  ToolCaseIcon,
  BoxIcon,
  Database,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const auth = getAuth(app);

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error: unknown) {
      alert((error as Error).message);
    }
  };

  return (
    <div
      className={`relative flex h-screen flex-col justify-between border-r bg-primary text-primary-foreground p-4 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col space-y-4">
        <h2
          className={`text-2xl font-bold mb-6 ${isOpen ? "block" : "hidden"}`}
        >
          Datek Holding
        </h2>
        <Link
          href="/"
          className={`${
            !isOpen && "w-32 pl-1"
          } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
        >
          <Home className="h-6 w-6" />
          {isOpen && <span>Dashboard</span>}
        </Link>
        <Link
          href="/users"
          className={`${
            !isOpen && "w-32 pl-1"
          } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
        >
          <User className="h-6 w-6" />
          {isOpen && <span>Employee</span>}
        </Link>
        <Collapsible asChild>
          <div className="flex flex-col">
            <CollapsibleTrigger
              className={`${
                !isOpen && "w-32 pl-1"
              } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
            >
              <Database className="h-6 w-6" />
              {isOpen && (
                <span className="flex-grow text-left">Master Data</span>
              )}
              {isOpen && <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 space-y-2">
              <Link
                href="/master-data/telepon"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Telepon
              </Link>
              <Link
                href="/master-data/synology"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Synology
              </Link>
              <Link
                href="/master-data/nvr-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                NVR CCTV
              </Link>
              <Link
                href="/master-data/camera-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Camera CCTV
              </Link>
              <Link
                href="/master-data/scanner"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Scanner
              </Link>
              <Link
                href="/master-data/fingerprint"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Fingerprint
              </Link>
              <Link
                href="/master-data/switch"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Switch
              </Link>
              <Link
                href="/master-data/radio"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Radio
              </Link>
              <Link
                href="/master-data/ups"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                UPS
              </Link>
              <Link
                href="/master-data/router"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Router
              </Link>
              <Link
                href="/master-data/komputer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Komputer
              </Link>
              <Link
                href="/master-data/access-point"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Access Point
              </Link>
              <Link
                href="/master-data/printer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Printer
              </Link>
              <Link
                href="/master-data/laptop"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Laptop
              </Link>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible asChild>
          <div className="flex flex-col">
            <CollapsibleTrigger
              className={`${
                !isOpen && "w-32 pl-1"
              } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
            >
              <BoxIcon className="h-6 w-6" />
              {isOpen && (
                <span className="flex-grow text-left">Manufaktur</span>
              )}
              {isOpen && <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 space-y-2">
              <Link
                href="/manufaktur/telepon"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Telepon
              </Link>
              <Link
                href="/manufaktur/synology"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Synology
              </Link>
              <Link
                href="/manufaktur/nvr-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                NVR CCTV
              </Link>
              <Link
                href="/manufaktur/camera-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Camera CCTV
              </Link>
              <Link
                href="/manufaktur/scanner"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Scanner
              </Link>
              <Link
                href="/manufaktur/fingerprint"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Fingerprint
              </Link>
              <Link
                href="/manufaktur/switch"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Switch
              </Link>
              <Link
                href="/manufaktur/radio"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Radio
              </Link>
              <Link
                href="/manufaktur/ups"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                UPS
              </Link>
              <Link
                href="/manufaktur/router"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Router
              </Link>
              <Link
                href="/manufaktur/komputer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Komputer
              </Link>
              <Link
                href="/manufaktur/access-point"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Access Point
              </Link>
              <Link
                href="/manufaktur/printer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Printer
              </Link>
              <Link
                href="/manufaktur/laptop"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Laptop
              </Link>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible asChild>
          <div className="flex flex-col">
            <CollapsibleTrigger
              className={`${
                !isOpen && "w-32 pl-1"
              } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
            >
              <Package className="h-6 w-6" />
              {isOpen && <span className="flex-grow text-left">Items</span>}
              {isOpen && <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 space-y-2">
              <Link
                href="/items/telepon"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Telepon
              </Link>
              <Link
                href="/items/synology"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Synology
              </Link>
              <Link
                href="/items/nvr-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                NVR CCTV
              </Link>
              <Link
                href="/items/camera-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Camera CCTV
              </Link>
              <Link
                href="/items/scanner"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Scanner
              </Link>
              <Link
                href="/items/fingerprint"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Fingerprint
              </Link>
              <Link
                href="/items/switch"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Switch
              </Link>
              <Link
                href="/items/radio"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Radio
              </Link>
              <Link
                href="/items/ups"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                UPS
              </Link>
              <Link
                href="/items/router"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Router
              </Link>
              <Link
                href="/items/komputer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Komputer
              </Link>
              <Link
                href="/items/access-point"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Access Point
              </Link>
              <Link
                href="/items/printer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Printer
              </Link>
              <Link
                href="/items/laptop"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Laptop
              </Link>
            </CollapsibleContent>
          </div>
        </Collapsible>
        <Collapsible asChild>
          <div className="flex flex-col">
            <CollapsibleTrigger
              className={`${
                !isOpen && "w-32 pl-1"
              } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
            >
              <List className="h-6 w-6" />
              {isOpen && <span className="flex-grow text-left">View Device</span>}
              {isOpen && <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 space-y-2">
              <Link
                href="/view-devices/telepon"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Telepon
              </Link>
              <Link
                href="/view-devices/synology"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Synology
              </Link>
              <Link
                href="/view-devices/nvr-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                NVR CCTV
              </Link>
              <Link
                href="/view-devices/camera-cctv"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Camera CCTV
              </Link>
              <Link
                href="/view-devices/scanner"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Scanner
              </Link>
              <Link
                href="/view-devices/fingerprint"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Fingerprint
              </Link>
              <Link
                href="/view-devices/switch"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Switch
              </Link>
              <Link
                href="/view-devices/radio"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Radio
              </Link>
              <Link
                href="/view-devices/ups"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                UPS
              </Link>
              <Link
                href="/view-devices/router"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Router
              </Link>
              <Link
                href="/view-devices/komputer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Komputer
              </Link>
              <Link
                href="/view-devices/access-point"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Access Point
              </Link>
              <Link
                href="/view-devices/printer"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Printer
              </Link>
              <Link
                href="/view-devices/laptop"
                className="block px-3 py-1 hover:bg-primary-foreground/10 rounded-md"
              >
                Laptop
              </Link>
            </CollapsibleContent>
          </div>
        </Collapsible>
        <Link
          href="/service-record"
          className={`${
            !isOpen && "w-32 pl-1"
          } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
        >
          <ToolCaseIcon className="h-6 w-6" />
          {isOpen && <span>Service Record</span>}
        </Link>
      </div>
      <Button
        onClick={handleLogout}
        className="flex items-center space-x-3 rounded-md bg-destructive px-3 py-2 hover:bg-destructive/90"
      >
        <LogOut className="h-6 w-6" />
        {isOpen && <span>Keluar</span>}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={`absolute top-1/2 -right-4 -translate-y-1/2 rounded-full bg-background border border-border ${
          isOpen ? "rotate-0" : "rotate-180"
        }`}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
    </div>
  );
}
