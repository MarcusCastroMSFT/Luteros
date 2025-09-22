"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { PaidBadge } from "@/components/common/badges/paid-badge"
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

export interface ArticleRow {
  id: string
  title: string
  author: string
  category: string
  status: "Ativo" | "Rascunho" | "Inativo"
  paid: "Free" | "Paid" | "Gratuito" | "Pago"
  date: string
  readTime: string
  commentCount: number
}

export const articleColumns: ColumnDef<ArticleRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Artigo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium max-w-[300px] truncate">{row.getValue("title")}</div>
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
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categoria
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
    ),
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
            inactive: "Inativo"
          }}
        />
      )
    },
  },
  {
    accessorKey: "paid",
    header: "Tipo",
    cell: ({ row }) => {
      const paid = row.getValue("paid") as string
      return <PaidBadge value={paid} />
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("date")}</div>
    ),
  },
  {
    accessorKey: "readTime",
    header: "Tempo de Leitura",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("readTime")}</div>
    ),
  },
  {
    accessorKey: "commentCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Comentários
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm text-center">{row.getValue("commentCount")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const article = row.original

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
              onClick={() => navigator.clipboard.writeText(article.id)}
            >
              Copiar ID do artigo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver artigo</DropdownMenuItem>
            <DropdownMenuItem>Editar artigo</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Excluir artigo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
