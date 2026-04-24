"use client";

import Navbar from "@/components/Navbar";
import NavbarBoundary from "@/components/NavbarBoundary";
import { Toaster } from "sonner";
import { Providers } from "@/app/providers";
import NextAuthProvider from "@/app/providers/next-auth-provider";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth");
  const isLandingPage = pathname === "/";
  const hideNavbar = isAuthRoute || isLandingPage;

  return (
    <NextAuthProvider>
      <Providers>
        <div className="flex min-h-[100dvh] min-w-0 flex-col">
          {!hideNavbar && (
            <>
              <NavbarBoundary>
                <Navbar />
              </NavbarBoundary>
              <div className="h-[68px] shrink-0 sm:h-[76px]" aria-hidden="true" />
            </>
          )}
          <main className="flex-1 pb-4 sm:pb-0">
            {children}
          </main>
        </div>
        <Toaster />
      </Providers>
    </NextAuthProvider>
  );
}
