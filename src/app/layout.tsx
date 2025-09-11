"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import NextAuthProvider from "./providers/next-auth-provider";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname?.startsWith("/auth");
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <NextAuthProvider>
          <Providers>
            {!isAuthRoute && <Navbar />}
            <main className="flex-1 overflow-y-auto">{children}</main>
            <Toaster  />
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}
