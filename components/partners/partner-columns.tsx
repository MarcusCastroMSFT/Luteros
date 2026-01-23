"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Eye, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewPartnerModal } from "./view-partner-modal"
import { DeletePartnerModal } from "./delete-partner-modal"

export interface PartnerRow {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
  email?: string
  phone?: string
  description?: string
  productsCount: number
  status: "Ativo" | "Inativo"
  createdAt: string
}

// Badge component for status
function StatusBadge({ value }: { value: "Ativo" | "Inativo" }) {
  if (value === "Ativo") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        Ativo
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
      Inativo
    </Badge>
  )
}

export const partnerColumns: ColumnDef<PartnerRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Parceiro
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const logo = row.original.logo
      const name = row.getValue("name") as string
      return (
        <div className="flex items-center gap-3">
          {logo ? (
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={logo}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-medium max-w-[200px] truncate">{name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const email = row.getValue("email") as string | undefined
      return email ? (
        <span className="text-sm">{email}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    },
  },
  {
    accessorKey: "productsCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produtos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count = row.getValue("productsCount") as number
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          {count} {count === 1 ? 'produto' : 'produtos'}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <StatusBadge value={row.getValue("status")} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Criado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const partner = row.original
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showViewModal, setShowViewModal] = useState(false)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showDeleteModal, setShowDeleteModal] = useState(false)

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowViewModal(true)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`/admin/partners/${partner.id}/edit`}
                  className="cursor-pointer flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </a>
              </DropdownMenuItem>
              {partner.website && (
                <DropdownMenuItem asChild>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer flex items-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visitar site
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteModal(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewPartnerModal
            partner={partner}
            open={showViewModal}
            onOpenChange={setShowViewModal}
          />

          <DeletePartnerModal
            partner={partner}
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
          />
        </>
      )
    },
  },
]
