"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/badges/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface NewsletterRow {
  id: string
  title: string
  subject: string
  type: "Newsletter" | "Promocional" | "Educacional" | "Anúncio"
  status: "Ativo" | "Rascunho" | "Inativo" | "Enviado"
  targetAudience: string
  scheduledDate: string
  openRate?: number
  clickRate?: number
  subscriberCount: number
  author: string
  createdDate: string
}

export const newsletterColumns: ColumnDef<NewsletterRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Campanha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium max-w-[300px]">
        <div className="truncate">{row.getValue("title")}</div>
        <div className="text-sm text-muted-foreground truncate">
          {row.original.subject}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      
      const typeColors = {
        "Newsletter": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        "Promocional": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
        "Educacional": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        "Anúncio": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      }
      
      return (
        <Badge variant="outline" className={typeColors[type as keyof typeof typeColors]}>
          {type}
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
            draft: "Rascunho", 
            inactive: "Inativo",
            suspended: "Enviado"
          }}
        />
      )
    },
  },
  {
    accessorKey: "targetAudience",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Público-Alvo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("targetAudience")}</div>
    ),
  },
  {
    accessorKey: "subscriberCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assinantes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.getValue<number>("subscriberCount").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "openRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Taxa de Abertura
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const openRate = row.getValue<number>("openRate")
      if (!openRate || openRate === 0) {
        return <div className="text-sm text-muted-foreground">-</div>
      }
      return <div className="text-sm font-medium">{openRate}%</div>
    },
  },
  {
    accessorKey: "clickRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Taxa de Clique
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const clickRate = row.getValue<number>("clickRate")
      if (!clickRate || clickRate === 0) {
        return <div className="text-sm text-muted-foreground">-</div>
      }
      return <div className="text-sm font-medium">{clickRate}%</div>
    },
  },
  {
    accessorKey: "scheduledDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data Programada
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("scheduledDate")}</div>
    ),
  },
  {
    accessorKey: "author",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Autor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("author")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const newsletter = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(newsletter.id)}
            >
              Copiar ID da campanha
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver campanha</DropdownMenuItem>
            <DropdownMenuItem>Editar campanha</DropdownMenuItem>
            <DropdownMenuItem>Duplicar campanha</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver métricas</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Excluir campanha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
