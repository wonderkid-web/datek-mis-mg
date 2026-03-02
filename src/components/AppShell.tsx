"use client";

import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { Providers } from "@/app/providers";
import NextAuthProvider from "@/app/providers/next-auth-provider";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";
  const hideNavbar = isAuthRoute || isLandingPage;

  return (
    <NextAuthProvider>
      <Providers>
        {!hideNavbar && <Navbar />}
        <main className="flex-1 overflow-y-auto pb-4 sm:pb-0">{children}</main>
        <Toaster />
      </Providers>
    </NextAuthProvider>
  );
}
