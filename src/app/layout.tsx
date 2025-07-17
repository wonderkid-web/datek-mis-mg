"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata is not directly used in client components, but kept for consistency if parts of layout were server-rendered


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}
      >
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Memuat...</div>; // Or a proper loading spinner
  }

  return (
    <>
      {user && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
      <div className={`flex-1 overflow-y-auto transition-all duration-300`}> {/* Adjust margin based on sidebar state */}
        {children}
      </div>
    </>
  );
}

