"use client";
// @ts-nocheck
import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react"; // Import useRef and useEffect
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

export default function Navbar() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({}); // Ref for each dropdown

  const handleLogout = async () => {
    try {
      router.push("/auth");
    } catch (error: unknown) {
      alert((error as Error).message);
    }
  };

  const closeSheet = () => setIsSheetOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside any open dropdown
      let isOutside = true;
      for (const key in dropdownRefs.current) {
        if (dropdownRefs.current[key] && dropdownRefs.current[key]?.contains(event.target as Node)) {
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
  }, [openDropdown]); // Re-run effect when openDropdown changes

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Datek Holding
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {navigationItems.map((item) =>
            item.children ? (
              // Dropdown for items with children
              
              <div key={item.name} className="relative"
              // @ts-expect-error its okay
              ref={(el) => (dropdownRefs.current[item.name] = el)}> {/* Attach ref */}
                <Button
                  variant="ghost"
                  onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                  className="flex items-center space-x-2 text-primary-foreground hover:bg-primary/90"
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Button>
                {openDropdown === item.name && (
                  <ul className="absolute top-full left-0 bg-green-700 text-white shadow-lg rounded-md mt-2 py-2 w-48 z-10">
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link href={child.href} className="block px-4 py-2 hover:bg-green-800">
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link key={item.name} href={item.href} passHref>
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
          <Button
            onClick={handleLogout}
            className="bg-destructive hover:bg-destructive/90 ml-4"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Keluar
          </Button>
        </div>

        {/* Mobile Menu */}
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
              <div className="mt-8 space-y-2">
                {navigationItems.map((item) =>
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
                      href={item.href}
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
      </div>
    </nav>
  );
}
