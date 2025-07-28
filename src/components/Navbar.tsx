"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useState, forwardRef } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
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

  const handleLogout = async () => {
    try {
      router.push("/auth");
    } catch (error: unknown) {
      alert((error as Error).message);
    }
  };

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Datek Holding
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {navigationItems.map((item) =>
                item.children ? (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuTrigger className="bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90">
                      <div className="flex items-center space-x-2">
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.name}</span>
                      </div>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        {item.children.map((child) => (
                          <ListItem
                            key={child.name}
                            href={child.href}
                            title={child.name}
                          >
                            {child.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-accent-foreground h-10 px-4 py-2 flex items-center space-x-2 rounded-md">
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.name}</span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
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

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
