"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, MessageCircle, Heart, AlertTriangle, Eye, Edit, Trash2, Shield } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface CommunityPostRow {
  id: string
  title: string
  content: string
  author: string
  category: "Gravidez" | "Pós-parto" | "Suporte Contínuo" | "Paternidade" | "Fertilidade" | "Menopausa"
  subcategory: string
  status: "Ativo" | "Fechado" | "Moderação"
  replies: unknown[] // Array of replies (not rendered directly)
  repliesCount: number
  likes: number
  isAnonymous: boolean
  createdDate: string
  lastReply: string
  tags: string[]
  isReported: boolean
}

export interface CommunityColumnActions {
  onViewDetails: (post: CommunityPostRow) => void
  onEdit: (post: CommunityPostRow) => void
  onModerate: (post: CommunityPostRow) => void
  onDelete: (post: CommunityPostRow) => void
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Gravidez":
      return "bg-pink-500 text-white hover:bg-pink-600"
    case "Pós-parto":
      return "bg-purple-500 text-white hover:bg-purple-600"
    case "Suporte Contínuo":
      return "bg-blue-500 text-white hover:bg-blue-600"
    case "Paternidade":
      return "bg-green-500 text-white hover:bg-green-600"
    case "Fertilidade":
      return "bg-lime-600 text-white hover:bg-lime-700"
    case "Menopausa":
      return "bg-orange-500 text-white hover:bg-orange-600"
    default:
      return "bg-gray-500 text-white hover:bg-gray-600"
  }
}

export function getCommunityColumns(actions: CommunityColumnActions): ColumnDef<CommunityPostRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer"
          >
            Post
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium max-w-[400px]">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{row.getValue("title")}</span>
            {row.original.isReported && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este post foi denunciado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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
            className="cursor-pointer"
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
          {row.original.subcategory && (
            <div className="text-xs text-muted-foreground">
              {row.original.subcategory}
            </div>
          )}
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
            className="cursor-pointer"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isReported = row.original.isReported
        const status = row.getValue("status") as string
        
        return (
          <div className="flex flex-col gap-1">
            <StatusBadge value={status} />
            {isReported && (
              <Badge variant="destructive" className="text-xs w-fit">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Denunciado
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "repliesCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer"
          >
            Respostas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("repliesCount")}</span>
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
            className="cursor-pointer"
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
            className="cursor-pointer"
          >
            Data de Criação
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.getValue("createdDate")}</div>
          {row.original.lastReply && (
            <div className="text-xs text-muted-foreground">
              Última resposta: {row.original.lastReply}
            </div>
          )}
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
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(post.id)}
                className="cursor-pointer"
              >
                Copiar ID do post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => actions.onViewDetails(post)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => actions.onEdit(post)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar post
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => actions.onModerate(post)}
                className="cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                Moderar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => actions.onDelete(post)}
                className="text-destructive cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// Keep for backwards compatibility
export const communityColumns: ColumnDef<CommunityPostRow>[] = getCommunityColumns({
  onViewDetails: () => {},
  onEdit: () => {},
  onModerate: () => {},
  onDelete: () => {},
})
