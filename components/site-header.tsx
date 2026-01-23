"use client"

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { navigationMenu } from "@/data/menu";
import { Logo } from "@/components/common/logo";
import { useAuth } from "@/contexts/auth-context";
import { HeaderUserMenu } from "@/components/header-user-menu";

export function SiteHeader() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm relative z-50">
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Logo iconSize="lg" textSize="lg" showText asLink />
      </div>          {/* Navigation - Desktop */}
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

          {/* Right side - Mobile Menu, Cart, Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2 cursor-pointer hover:bg-transparent hover:text-cta-highlight transition-colors">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto p-0">
                {/* Header with Logo */}
                <SheetHeader className="px-6 py-5 border-b bg-gray-50/50">
                  <SheetTitle className="text-left">
                    <Logo iconSize="md" textSize="md" showText />
                  </SheetTitle>
                </SheetHeader>
                
                {/* Navigation */}
                <nav className="flex flex-col px-6 py-4">
                  <Accordion type="single" collapsible className="w-full">
                    {navigationMenu.map((item, index) => (
                      item.items ? (
                        <AccordionItem key={item.title} value={`item-${index}`} className="border-b border-gray-100">
                          <AccordionTrigger className="py-4 text-base font-medium hover:no-underline hover:text-cta-highlight">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-col space-y-1 pl-3 pb-2">
                              {item.items.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className="py-2.5 px-3 text-sm text-muted-foreground hover:text-cta-highlight hover:bg-gray-50 rounded-md transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ) : (
                        <Link
                          key={item.title}
                          href={item.href!}
                          className="flex py-4 text-base font-medium hover:text-cta-highlight transition-colors border-b border-gray-100"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      )
                    ))}
                  </Accordion>
                </nav>
                  
                {/* Mobile Auth Buttons */}
                {!user && (
                  <div className="flex flex-col gap-3 px-6 py-6 mt-auto border-t bg-gray-50/50">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <Button variant="outline" className="w-full h-11 cursor-pointer text-base">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <Button className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 cursor-pointer text-base">
                        Criar Conta
                      </Button>
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Authentication - Desktop */}
            {user ? (
              <HeaderUserMenu />
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
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
