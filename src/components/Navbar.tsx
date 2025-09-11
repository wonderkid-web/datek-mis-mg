"use client";

import Link from "next/link";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
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

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const closeSheet = () => setIsSheetOpen(false);

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

  const isAdmin = (session?.user as any)?.role === "administrator";
  const navItems = navigationItems.filter((item) => isAdmin || item.name !== "Asset");

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Datek Holding
        </Link>

        {/* Loading Skeleton */}
        {status === "loading" && (
          <div className="hidden md:flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}

        {/* Desktop Menu */}
        {status === "authenticated" && (
          <div className="hidden md:flex items-center space-x-4">
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
                    <span>{item.name}</span>
                  </Button>
                  {openDropdown === item.name && (
                    <ul className="absolute top-full left-0 bg-green-700 text-white shadow-lg rounded-md mt-2 py-2 w-48 z-10">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2 hover:bg-green-800"
                          >
                            {child.name}
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
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            )}
            <div className="flex items-center space-x-2 border-l border-green-400 pl-4 ml-4">
                <UserCircle className="h-6 w-6" />
                <span className="font-semibold">{session.user?.name?.split(" ")[0]}</span>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Keluar
            </Button>
          </div>
        )}

        {/* Mobile Menu */}
        {status === "authenticated" && (
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full max-w-xs bg-primary text-primary-foreground"
              >
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold text-primary-foreground">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex items-center space-x-2 p-3 rounded-md bg-green-700">
                    <UserCircle className="h-6 w-6" />
                    <span className="font-semibold">{session.user?.name}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {navItems.map((item) =>
                    item.children ? (
                      <Collapsible key={item.name}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-primary-foreground/10">
                          <div className="flex items-center space-x-2">
                            {item.icon && <item.icon className="h-5 w-5" />}
                            <span>{item.name}</span>
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
                              {child.name}
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
                        <span>{item.name}</span>
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
                    Keluar
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
