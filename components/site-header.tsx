"use client"

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { navigationMenu } from "@/data/menu";
import { Logo } from "@/components/common/logo";
import { useAuth } from "@/contexts/auth-context";
import { HeaderUserMenu } from "@/components/header-user-menu";

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm relative z-50">
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Logo iconSize="lg" textSize="lg" showText asLink />
      </div>          {/* Navigation */}
          <NavigationMenu viewport={false} className="hidden lg:flex">
            <NavigationMenuList>
              {navigationMenu.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.items ? (
                    <>
                      <NavigationMenuTrigger className="text-text-primary hover:text-cta-highlight">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {item.title === "Home" ? (
                          <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                              <NavigationMenuLink asChild>
                                <Link
                                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                  href="/"
                                >
                                  <div className="mb-2 mt-4 text-lg font-medium">
                                    UpSkill
                                  </div>
                                  <p className="text-sm leading-tight text-muted-foreground">
                                    Learn new skills with our comprehensive courses and expert instructors.
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                            {item.items.map((subItem) => (
                              <ListItem key={subItem.href} href={subItem.href} title={subItem.title}>
                                {subItem.description}
                              </ListItem>
                            ))}
                          </ul>
                        ) : (
                          <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.items.map((subItem) => (
                              <ListItem key={subItem.href} href={subItem.href} title={subItem.title}>
                                {subItem.description}
                              </ListItem>
                            ))}
                          </ul>
                        )}
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link href={item.href!}>
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side - Cart, Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative p-2 cursor-pointer hover:bg-transparent hover:text-cta-highlight transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </Button>

            {/* Authentication */}
            {user ? (
              <HeaderUserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-text-primary hover:text-cta-highlight hover:bg-transparent cursor-pointer">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 cursor-pointer transition-colors">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
