"use client";

import Link from "next/link";
import { LogOut, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { navigationItems } from "@/lib/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCollapsibleName, setOpenCollapsibleName] = useState<string | null>(
    null
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error: unknown) {
      alert((error as Error).message);
    }
  };

  const handleCollapsibleToggle = (itemName: string) => {
    setOpenCollapsibleName(openCollapsibleName === itemName ? null : itemName);
  };

  const handleLinkClick = () => {
    setOpenCollapsibleName(null);
    setIsMobileMenuOpen(false); // Close mobile menu as well
  };

  const auth = getAuth(app);

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Datek Holding
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 items-center">
          {navigationItems.map((item) =>
            item.children ? (
              <Collapsible
                key={item.name}
                open={openCollapsibleName === item.name}
                onOpenChange={() => handleCollapsibleToggle(item.name)}
              >
                <CollapsibleTrigger className="flex items-center space-x-1 hover:text-primary-foreground/80">
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute bg-primary mt-2 py-2 rounded-md shadow-lg z-10">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="block px-4 py-2 hover:bg-primary-foreground/10"
                      onClick={handleLinkClick}
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
                className="flex items-center space-x-1 hover:text-primary-foreground/80"
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.name}</span>
              </Link>
            )
          )}
          <Button
            onClick={handleLogout}
            className="bg-destructive hover:bg-destructive/90"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          {navigationItems.map((item) =>
            item.children ? (
              <Collapsible
                key={item.name}
                open={openCollapsibleName === item.name}
                onOpenChange={() => handleCollapsibleToggle(item.name)}
              >
                <CollapsibleTrigger className="flex items-center space-x-2 w-full py-2 px-3 rounded-md hover:bg-primary-foreground/10">
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="block px-4 py-2 hover:bg-primary-foreground/10 rounded-md"
                      onClick={handleLinkClick}
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
                onClick={handleLinkClick}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.name}</span>
              </Link>
            )
          )}
          <Button
            onClick={handleLogout}
            className="w-full bg-destructive hover:bg-destructive/90 mt-2"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Keluar
          </Button>
        </div>
      )}
    </nav>
  );
}
