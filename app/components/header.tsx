"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { WalletConnection } from "./wallet-connection";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(className, "p-4 flex justify-between bg-popover")}>
      <NavigationMenu>
        <NavigationMenuList className="gap-2">
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Gallery
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/create" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <span className="font-bold inline-block text-transparent bg-clip-text bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500">
                  New +
                </span>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-2">
        <ThemeToggle />
        <WalletConnection />
      </div>
    </header>
  );
}
