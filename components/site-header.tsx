"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Info,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import { Logo } from "@/components/common/logo"
import { HeaderUserMenu } from "@/components/header-user-menu"
import { SocialLinks } from "@/components/social-links"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { moreNav, primaryNav, type NavIconKey, type NavLinkItem } from "@/data/menu"
import { cn } from "@/lib/utils"

const ICONS: Record<NavIconKey, LucideIcon> = {
  courses: BookOpen,
  articles: Newspaper,
  products: ShoppingBag,
  about: Info,
  contact: Mail,
  faq: CircleHelp,
  help: LifeBuoy,
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > threshold)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [threshold])

  return scrolled
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

const navLink =
  "inline-flex h-11 items-center rounded-lg px-3 text-[14.5px] font-medium text-[#0a2f33]/75 transition-colors duration-200 hover:bg-[#198189]/8 hover:text-[#146b71] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#198189] data-[active=true]:bg-[#198189]/8 data-[active=true]:text-[#146b71]"

export function SiteHeader() {
  const { user, userProfile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const scrolled = useScrolled()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)
  const displayName = userProfile?.displayName || userProfile?.name || user?.email?.split("@")[0] || "Minha conta"

  const handleSignOut = async () => {
    closeMobile()
    await signOut()
    router.push("/login")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[#0a2f33]/10 transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none",
        scrolled
          ? "bg-white/95 shadow-[0_8px_24px_-16px_rgba(10,47,51,0.3)] backdrop-blur-xl"
          : "bg-white"
      )}
    >
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-full bg-[#0a2f33] px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-5 focus:top-4"
      >
        Pular para o conteúdo
      </a>

      <div className="mx-auto flex h-[72px] max-w-[1428px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-20 lg:px-10">
        <div className="flex-shrink-0">
          <Logo iconSize="lg" asLink eager />
        </div>

        <DesktopNav pathname={pathname} />

        <div className="flex items-center gap-1.5">
          {user ? (
            <HeaderUserMenu />
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-lg px-4 text-[14.5px] font-medium text-[#0a2f33]/80 transition-colors duration-200 hover:bg-[#198189]/8 hover:text-[#0a2f33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#198189]"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="group inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-[#198189] px-4 text-[14.5px] font-semibold text-white transition-colors duration-200 hover:bg-[#126a71] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#198189]"
              >
                Criar conta
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-full text-[#0a2f33] transition-colors hover:bg-[#198189]/10 focus-visible:outline-2 focus-visible:outline-[#198189] lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined} className="flex w-[92vw] max-w-sm flex-col gap-0 overflow-y-auto bg-[#faf8f4] p-0">
              <SheetHeader className="border-b border-[#0a2f33]/10 px-6 py-5">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div onClick={closeMobile}><Logo iconSize="lg" asLink /></div>
              </SheetHeader>

              <div className="px-5 pt-5">
                {user ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#0a2f33]/10 bg-white p-4">
                    <UserAvatar name={displayName} avatar={userProfile?.image} className="size-11" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0a2f33]">{displayName}</p>
                      <p className="truncate text-xs text-[#4f666a]">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-2xl border border-[#0a2f33]/10 bg-white p-4">
                    <p className="text-sm leading-6 text-[#4f666a]">
                      Crie sua conta gratuita para acessar cursos, salvar artigos e participar da comunidade.
                    </p>
                    <Link
                      href="/register"
                      onClick={closeMobile}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#0f5a60] bg-gradient-to-b from-[#1f939b] via-[#198189] to-[#126a71] text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                    >
                      Criar conta
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="flex h-12 items-center justify-center rounded-xl border border-[#0a2f33]/15 bg-white text-[15px] font-medium text-[#0a2f33] transition-colors hover:bg-[#198189]/8"
                    >
                      Entrar
                    </Link>
                  </div>
                )}
              </div>

              <nav aria-label="Menu móvel" className="flex-1 space-y-6 px-5 py-6">
                <MobileSection title="Explorar" items={primaryNav} pathname={pathname} onNavigate={closeMobile} />
                <MobileSection title="Institucional" items={moreNav} pathname={pathname} onNavigate={closeMobile} />
              </nav>

              <div className="space-y-4 border-t border-[#0a2f33]/10 bg-white/60 px-6 py-5">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0a2f33]/15 bg-white text-sm font-medium text-[#0a2f33] transition-colors hover:bg-[#198189]/8"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Sair
                  </button>
                ) : null}
                <div className="flex items-center justify-between text-xs text-[#4f666a]">
                  <span className="inline-flex items-center gap-1.5">
                    <LockKeyhole className="size-3.5" aria-hidden="true" />
                    Seus dados são tratados com sigilo
                  </span>
                  <SocialLinks className="space-x-3" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul className="flex items-center gap-0.5">
        {primaryNav.map((item) => {
          const active = isActivePath(pathname, item.href)
          return (
            <li key={item.href}>
              <Link href={item.href} className={navLink} data-active={active} aria-current={active ? "page" : undefined}>
                {item.title}
              </Link>
            </li>
          )
        })}

        <MoreMenu key={pathname} pathname={pathname} />
      </ul>
    </nav>
  )
}

function MoreMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLLIElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const openedByHover = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const panelId = useId()
  const active = moreNav.some((item) => isActivePath(pathname, item.href))

  const openNow = () => {
    clearTimeout(closeTimer.current)
    if (!open) openedByHover.current = true
    setOpen(true)
  }
  const closeSoon = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      if (!rootRef.current?.contains(document.activeElement)) setOpen(false)
    }, 160)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <li
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") openNow()
      }}
      onMouseLeave={closeSoon}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cn(navLink, "gap-1.5", open && "bg-[#198189]/8 text-[#146b71]")}
        data-active={active}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(event) => {
          clearTimeout(closeTimer.current)
          if (event.detail > 0 && openedByHover.current) setOpen(true)
          else setOpen((value) => !value)
          openedByHover.current = false
        }}
      >
        Mais
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open ? (
        <div id={panelId} className="absolute right-0 top-full z-50 pt-5">
          <div className="w-[580px] rounded-2xl border border-[#0a2f33]/10 bg-white p-3 shadow-[0_24px_64px_-24px_rgba(10,47,51,0.35)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 duration-200">
            <ul className="grid grid-cols-2 gap-1">
              {moreNav.map((item) => (
                <MoreLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />
              ))}
            </ul>

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="group mt-2 flex items-center justify-between gap-4 rounded-2xl bg-[#052628] px-5 py-3.5 text-white transition-colors duration-200 hover:bg-[#073538]"
            >
              <span>
                <span className="block text-sm font-semibold">Não encontrou o que procurava?</span>
                <span className="block text-[13px] text-white/65">Nossa equipe responde com atenção e sigilo.</span>
              </span>
              <span className="inline-flex flex-none items-center gap-1.5 text-sm font-semibold text-[#7fd3d8]">
                Fale com a gente
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </li>
  )
}

function MoreLink({
  item,
  pathname,
  className,
  onNavigate,
}: {
  item: NavLinkItem
  pathname: string
  className?: string
  onNavigate: () => void
}) {
  const Icon = ICONS[item.icon]
  const active = isActivePath(pathname, item.href)
  return (
    <li className={className}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className="group flex items-start gap-3.5 rounded-2xl p-3.5 transition-colors duration-200 hover:bg-[#198189]/8 focus-visible:bg-[#198189]/8 focus-visible:outline-none"
      >
        <span
          className={cn(
            "grid size-11 flex-none place-items-center rounded-xl transition-colors duration-200",
            active ? "bg-[#198189] text-white" : "bg-[#198189]/10 text-[#146b71] group-hover:bg-[#198189] group-hover:text-white"
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 pt-0.5">
          <span className="block text-sm font-semibold text-[#0a2f33]">{item.title}</span>
          <span className="mt-0.5 block text-[13px] leading-5 text-[#4f666a]">{item.description}</span>
        </span>
      </Link>
    </li>
  )
}

function MobileSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string
  items: NavLinkItem[]
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div>
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#630a79]">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = ICONS[item.icon]
          const active = isActivePath(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-[#198189]/8",
                  active && "bg-[#198189]/10"
                )}
              >
                <span
                  className={cn(
                    "grid size-10 flex-none place-items-center rounded-xl transition-colors duration-200",
                    active ? "bg-[#198189] text-white" : "bg-[#198189]/10 text-[#146b71] group-hover:bg-[#198189] group-hover:text-white"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[#0a2f33]">{item.title}</span>
                  <span className="block truncate text-xs text-[#4f666a]">{item.description}</span>
                </span>
                <ChevronRight className="size-4 flex-none text-[#7a8d90] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
