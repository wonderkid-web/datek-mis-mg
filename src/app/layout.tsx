import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Datek | Date Teknis Management System Information",
  description: "Datek MIS — Internal asset and service record management.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitializer = `
    (() => {
      try {
        const storageKey = 'datek-theme';
        const stored = localStorage.getItem(storageKey);
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
        if (theme === 'dark') document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', theme);
      } catch (error) {
        console.warn('Failed to set initial theme', error);
      }
    })();
  `;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializer }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
