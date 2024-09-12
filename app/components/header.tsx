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
import { useAppState } from "@/hooks/useAppState";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { create } = useAppState((state) => state.actions.collection);

  const handleNewCollection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const id = create("New Collection");
      router.push(`/create/${id}`);
    },
    [create, router]
  );

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
            <NavigationMenuLink
              href="/create"
              onClick={handleNewCollection}
              className={navigationMenuTriggerStyle()}
            >
              <span className="font-bold inline-block text-transparent bg-clip-text bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500">
                New +
              </span>
            </NavigationMenuLink>
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
