"use client";

import Link from "next/link";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import type { Session } from "next-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { navigationItems } from "@/lib/navigation";
import { Skeleton } from "./ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

let lastAuthenticatedSession: Session | null = null;
const SESSION_CACHE_KEY = "datek-last-session";

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedSession = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!storedSession) {
      return null;
    }

    return JSON.parse(storedSession) as Session;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [cachedSession, setCachedSession] = useState<Session | null>(
    lastAuthenticatedSession ?? readStoredSession()
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleLogout = async () => {
    lastAuthenticatedSession = null;
    setCachedSession(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_CACHE_KEY);
    }
    await signOut({ callbackUrl: "/login" });
  };

  const closeSheet = () => setIsSheetOpen(false);

  useEffect(() => {
    if (cachedSession) {
      return;
    }

    const storedSession = readStoredSession();
    if (storedSession) {
      lastAuthenticatedSession = storedSession;
      setCachedSession(storedSession);
    }
  }, [cachedSession]);

  useEffect(() => {
    if (session) {
      lastAuthenticatedSession = session;
      setCachedSession(session);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
      }
    }
  }, [session, status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let isOutside = true;
      for (const key in dropdownRefs.current) {
        if (
          dropdownRefs.current[key] &&
          dropdownRefs.current[key]?.contains(event.target as Node)
        ) {
          isOutside = false;
          break;
        }
      }
      if (isOutside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const activeSession = session ?? cachedSession;
  const displayName =
    activeSession?.user?.name?.trim() ||
    activeSession?.user?.email?.trim() ||
    "User";
  const displayInitial = displayName.charAt(0).toUpperCase() || "U";
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const showAuthenticatedUi = status === "authenticated" || Boolean(activeSession);
  const isAdmin = (activeSession?.user as any)?.role === "administrator";
  const navItems = navigationItems.filter((item) => isAdmin || item.name !== "Asset");
  const translateParentItem = (name: string) => {
    if (name === "Dashboard") return t("navbar.dashboard");
    if (name === "Employee") return t("navbar.employee");
    if (name === "Master Data") return t("navbar.masterData");
    if (name === "Asset") return t("navbar.asset");
    if (name === "Data Centre") return t("navbar.dataCentre");
    if (name === "Tracker") return t("navbar.tracker");
    if (name === "Service Records") return t("navbar.serviceRecords");
    return name;
  };
  const translateChildItem = (href: string, fallback: string) => {
    const key = `navbar.nav.${href}`;
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 shrink-0 bg-primary p-3 text-primary-foreground shadow-md sm:p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center justify-center text-base font-bold sm:text-lg">
          {t("common.appName")}
        </Link>

        {/* Loading Skeleton */}
        {status === "loading" && !showAuthenticatedUi && (
          <div className="hidden md:flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}

        {/* Desktop Menu */}
        {showAuthenticatedUi && (
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle className="text-primary-foreground hover:bg-primary/90" />
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.name}
                  className="relative"
                  // @ts-expect-error its okay
                  ref={(el: HTMLDivElement | null) =>
                    (dropdownRefs.current[item.name] = el)
                  }
                >
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setOpenDropdown(openDropdown === item.name ? null : item.name)
                    }
                    className="flex items-center space-x-2 text-primary-foreground hover:bg-primary/90"
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{translateParentItem(item.name)}</span>
                  </Button>
                  {openDropdown === item.name && (
                    <ul className="absolute top-full left-0 bg-green-700 text-white shadow-lg rounded-md mt-2 py-2 w-48 z-10">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2 hover:bg-green-800"
                          >
                            {translateChildItem(child.href, child.name)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link key={item.name} href={item.href as string} passHref>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-primary-foreground hover:bg-primary/90"
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{translateParentItem(item.name)}</span>
                  </Button>
                </Link>
              )
            )}
            <Link href="/profile" className="group flex items-center space-x-3 border-l border-green-400 pl-4 ml-4 hover:opacity-90">
              <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold">
                {displayInitial}
              </div>
              <span className="font-semibold">{firstName}</span>
            </Link>
            <Button
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              <LogOut className="h-5 w-5 mr-2" />
              {t("common.logout")}
            </Button>
          </div>
        )}

        {/* Mobile Menu */}
        {showAuthenticatedUi && (
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[88vw] max-w-sm bg-primary text-primary-foreground"
              >
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold text-primary-foreground">
                    {t("navbar.menu")}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex items-center space-x-3 rounded-md bg-green-700 p-3">
                  <div className="h-9 w-9 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold">
                    {displayInitial}
                  </div>
                  <span className="truncate font-semibold">{displayName}</span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md border border-primary-foreground/20 px-3 py-2">
                  <span className="text-sm">{t("common.theme")}</span>
                  <ThemeToggle variant="outline" className="border-white/40 text-white hover:bg-white/10" />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md border border-primary-foreground/20 px-3 py-2">
                  <span className="text-sm">{t("common.language")}</span>
                  <LanguageSwitcher compact />
                </div>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-primary-foreground/10"
                    onClick={closeSheet}
                  >
                    <UserCircle className="h-5 w-5" />
                    <span>{t("common.profile")}</span>
                  </Link>
                  {navItems.map((item) =>
                    item.children ? (
                      <Collapsible key={item.name}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-primary-foreground/10">
                          <div className="flex items-center space-x-2">
                            {item.icon && <item.icon className="h-5 w-5" />}
                            <span>{translateParentItem(item.name)}</span>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 rounded-md hover:bg-primary-foreground/10"
                              onClick={closeSheet}
                            >
                              {translateChildItem(child.href, child.name)}
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href as string}
                        className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-primary-foreground/10"
                        onClick={closeSheet}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{translateParentItem(item.name)}</span>
                      </Link>
                    )
                  )}
                  <Button
                    onClick={() => {
                      handleLogout();
                      closeSheet();
                    }}
                    className="w-full bg-destructive hover:bg-destructive/90 mt-4"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    {t("common.logout")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </nav>
  );
}
