"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, MessageCircle, Heart } from "lucide-react"
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

export interface CommunityPostRow {
  id: string
  title: string
  content: string
  author: string
  category: "Gravidez" | "Pós-parto" | "Suporte Contínuo" | "Paternidade" | "Fertilidade" | "Menopausa"
  subcategory: string
  status: "Ativo" | "Fechado" | "Moderação"
  replies: number
  likes: number
  isAnonymous: boolean
  createdDate: string
  lastReply: string
  tags: string[]
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Gravidez":
      return "bg-pink-100 text-pink-800"
    case "Pós-parto":
      return "bg-purple-100 text-purple-800"
    case "Suporte Contínuo":
      return "bg-blue-100 text-blue-800"
    case "Paternidade":
      return "bg-green-100 text-green-800"
    case "Fertilidade":
      return "bg-brand-100 text-brand-800"
    case "Menopausa":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const communityColumns: ColumnDef<CommunityPostRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Post
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium max-w-[400px]">
        <div className="truncate font-semibold">{row.getValue("title")}</div>
        <div className="text-sm text-muted-foreground truncate mt-1">
          {row.original.content.substring(0, 100)}...
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">
            por {row.original.isAnonymous ? "Anônimo" : row.original.author}
          </span>
          {row.original.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
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
      <div className="space-y-1">
        <Badge className={getCategoryColor(row.getValue("category"))}>
          {row.getValue("category")}
        </Badge>
        <div className="text-xs text-muted-foreground">
          {row.original.subcategory}
        </div>
      </div>
    ),
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
    cell: ({ row }) => (
      <StatusBadge value={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "replies",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Respostas
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue("replies")}</span>
      </div>
    ),
  },
  {
    accessorKey: "likes",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Curtidas
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <Heart className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue("likes")}</span>
      </div>
    ),
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data de Criação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{row.getValue("createdDate")}</div>
        <div className="text-xs text-muted-foreground">
          Última resposta: {row.original.lastReply}
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const post = row.original

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
              onClick={() => navigator.clipboard.writeText(post.id)}
            >
              Copiar ID do post
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem>Editar post</DropdownMenuItem>
            <DropdownMenuItem>Moderar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Excluir post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
