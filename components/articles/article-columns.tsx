"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Eye, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { PaidBadge } from "@/components/common/badges/paid-badge"
import { StatusBadge } from "@/components/common/badges/status-badge"
import { AudienceBadge } from "@/components/common/badges/audience-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewArticleModal } from "./view-article-modal"
import { DeleteArticleModal } from "./delete-article-modal"

export interface ArticleRow {
  id: string
  title: string
  slug?: string
  author: string
  category: string
  status: "Ativo" | "Rascunho" | "Inativo"
  paid: "Free" | "Paid" | "Gratuito" | "Pago"
  audience: "Médicos" | "Público Geral"
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
    accessorKey: "audience",
    header: "Público",
    cell: ({ row }) => {
      const audience = row.getValue("audience") as string
      return <AudienceBadge value={audience} />
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
    cell: ({ row }) => {
      const dateString = row.getValue("date") as string
      const date = new Date(dateString)
      return (
        <div className="text-sm">
          {date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      )
    },
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
    cell: ({ row, table }) => {
      const article = row.original
      const [viewModalOpen, setViewModalOpen] = useState(false)
      const [deleteModalOpen, setDeleteModalOpen] = useState(false)

      const handleDeleteSuccess = () => {
        // Optimistically update UI by removing the article
        const meta = table.options.meta as { onDeleteArticle?: (id: string) => void }
        meta?.onDeleteArticle?.(article.id)
      }

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
              {article.status !== "Rascunho" && article.slug && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir artigo publicado
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setViewModalOpen(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver artigo
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => window.location.href = `/dashboard/articles/${article.id}/edit`}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar artigo
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400">Excluir artigo</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewArticleModal
            articleId={article.id}
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
          />

          <DeleteArticleModal
            articleId={article.id}
            articleTitle={article.title}
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )
    },
  },
]
