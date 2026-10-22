"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bookmark, CalendarDays, ChevronDown, GraduationCap, LogOut, Settings2, UserRound } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useAuth } from "@/contexts/auth-context"

const itemClass =
  "cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-sm text-[#0a2f33] focus:bg-[#198189]/10 focus:text-[#0a2f33]"

export function HeaderUserMenu() {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  const displayName = userProfile?.displayName || userProfile?.name || user?.email?.split("@")[0] || "Minha conta"
  const userEmail = user?.email || ""
  const canAccessAdmin = userProfile?.role === "ADMIN" || userProfile?.role === "INSTRUCTOR"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex h-11 cursor-pointer items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-[#198189]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#198189] data-[state=open]:bg-[#198189]/10"
          aria-label="Abrir menu da conta"
        >
          <UserAvatar
            name={displayName}
            avatar={userProfile?.image}
            className="size-9 ring-2 ring-white ring-offset-1 ring-offset-[#198189]/30"
          />
          <ChevronDown
            className="hidden size-4 text-[#4f666a] transition-transform duration-200 group-data-[state=open]:rotate-180 sm:block"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-2xl border-[#0a2f33]/10 bg-white/95 p-2 shadow-[0_30px_70px_-30px_rgba(10,47,51,0.5)] backdrop-blur-xl"
        align="end"
        sideOffset={10}
      >
        <DropdownMenuLabel className="flex items-center gap-3 rounded-xl bg-[#198189]/8 p-3 font-normal">
          <UserAvatar name={displayName} avatar={userProfile?.image} className="size-10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0a2f33]">{displayName}</p>
            <p className="truncate text-xs text-[#4f666a]">{userEmail}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="mt-2">
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/courses/my-courses">
              <GraduationCap className="size-4 text-[#198189]" aria-hidden="true" />
              Meus cursos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/profile">
              <UserRound className="size-4 text-[#198189]" aria-hidden="true" />
              Meu perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/events/my-events">
              <CalendarDays className="size-4 text-[#198189]" aria-hidden="true" />
              Meus eventos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/articles/saved">
              <Bookmark className="size-4 text-[#198189]" aria-hidden="true" />
              Artigos salvos
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {canAccessAdmin ? (
          <>
            <DropdownMenuSeparator className="bg-[#0a2f33]/10" />
            <DropdownMenuItem asChild className={itemClass}>
              <Link href="/admin">
                <Settings2 className="size-4 text-[#630a79]" aria-hidden="true" />
                Administração
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuSeparator className="bg-[#0a2f33]/10" />
        <DropdownMenuItem onClick={handleLogout} className={itemClass}>
          <LogOut className="size-4 text-[#4f666a]" aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
