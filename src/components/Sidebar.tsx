"use client";

import Link from "next/link";
import {
  Home,
  Package,
  Repeat,
  History,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <Repeat className="h-6 w-6" />
          {isOpen && <span>Users</span>}
        </Link>
        <Link
          href="/departments"
          className={`${
            !isOpen && "w-32 pl-1"
          } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
        >
          <History className="h-6 w-6" />
          {isOpen && <span>Departments</span>}
        </Link>
        <Link
          href="/items"
          className={`${
            !isOpen && "w-32 pl-1"
          } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
        >
          <Package className="h-6 w-6" />
          {isOpen && <span>Tambah Barang</span>}
        </Link>
        <Link
          href="/stock-moves"
          className={`${
            !isOpen && "w-32 pl-1"
          } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
        >
          <Repeat className="h-6 w-6" />
          {isOpen && <span>Tambah Data</span>}
        </Link>
        <Link
          href="/stock-moves/history"
          className={`${
            !isOpen && "w-32 pl-1"
          } flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-primary-foreground`}
        >
          <History className="h-6 w-6" />
          {isOpen && <span>Riwayat Barang</span>}
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
