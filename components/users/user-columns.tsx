"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/common/badges/status-badge"
import { IconDotsVertical, IconEdit, IconTrash, IconEye } from "@tabler/icons-react"

export interface User {
  id: number
  name: string
  username: string
  email: string
  profileImg: string
  status: "Ativo" | "Inativo" | "Pendente" | "Suspenso" | "Rascunho"
  role: "Administrador" | "Editor" | "Moderador" | "Premium" | "Usuário"
}

export const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Usuário",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImg} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Função",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      
      const roleColors = {
        "Administrador": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        "Editor": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "Moderador": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        "Premium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        "Usuário": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      }
      
      return (
        <Badge variant="outline" className={roleColors[role as keyof typeof roleColors]}>
          {role}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      return (
        <StatusBadge 
          value={status}
          labels={{
            active: "Ativo",
            draft: "Pendente",
            inactive: "Inativo",
            suspended: "Suspenso"
          }}
        />
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <IconEye className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconEdit className="mr-2 h-4 w-4" />
              Editar usuário
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <IconTrash className="mr-2 h-4 w-4" />
              Excluir usuário
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
