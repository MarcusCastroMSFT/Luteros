"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Eye, Edit, Trash2, Copy } from "lucide-react"
import { useState } from "react"
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
import { ViewProductModal } from "./view-product-modal"
import { DeleteProductModal } from "./delete-product-modal"

export interface ProductRow {
  id: string
  title: string
  slug: string
  partner: string
  category: string
  discount: number
  promoCode: string
  availability: "all" | "members"
  status: "Ativo" | "Inativo"
  isFeatured: boolean
  usageCount: number
  maxUsages?: number
  validUntil: string
  createdAt: string
}

// Badge component for availability
function AvailabilityBadge({ value }: { value: "all" | "members" }) {
  if (value === "members") {
    return (
      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
        Membros
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
      Todos
    </Badge>
  )
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

// Badge component for featured
function FeaturedBadge({ isFeatured }: { isFeatured: boolean }) {
  if (isFeatured) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        Destaque
      </Badge>
    )
  }
  return null
}

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium max-w-[250px] truncate">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "partner",
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
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("partner")}</div>
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
    accessorKey: "discount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Desconto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const discount = row.getValue("discount") as number
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          {discount}% OFF
        </Badge>
      )
    },
  },
  {
    accessorKey: "promoCode",
    header: "Código",
    cell: ({ row }) => (
      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
        {row.getValue("promoCode")}
      </code>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "Ativo" | "Inativo"
      return <StatusBadge value={status} />
    },
  },
  {
    accessorKey: "availability",
    header: "Acesso",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as "all" | "members"
      return <AvailabilityBadge value={availability} />
    },
  },
  {
    accessorKey: "isFeatured",
    header: "Destaque",
    cell: ({ row }) => {
      const isFeatured = row.getValue("isFeatured") as boolean
      return <FeaturedBadge isFeatured={isFeatured} />
    },
  },
  {
    accessorKey: "usageCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Usos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const usageCount = row.getValue("usageCount") as number
      const maxUsages = row.original.maxUsages
      return (
        <div className="text-sm text-center">
          {usageCount.toLocaleString()}
          {maxUsages && <span className="text-gray-500">/{maxUsages}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "validUntil",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Válido até
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateString = row.getValue("validUntil") as string
      if (!dateString) return <span className="text-gray-500">-</span>
      const date = new Date(dateString)
      const isExpired = date < new Date()
      return (
        <div className={`text-sm ${isExpired ? 'text-red-600' : ''}`}>
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
    id: "actions",
    enableHiding: false,
    cell: function ActionsCell({ row, table }) {
      const product = row.original
      const [viewModalOpen, setViewModalOpen] = useState(false)
      const [deleteModalOpen, setDeleteModalOpen] = useState(false)
      const [copied, setCopied] = useState(false)

      const handleDeleteSuccess = () => {
        const meta = table.options.meta as { onDeleteProduct?: (id: string) => void }
        meta?.onDeleteProduct?.(product.id)
      }

      const copyPromoCode = async () => {
        try {
          await navigator.clipboard.writeText(product.promoCode)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error('Failed to copy:', err)
        }
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={copyPromoCode}
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? 'Copiado!' : 'Copiar código'}
              </DropdownMenuItem>
              {product.status === "Ativo" && product.slug && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir página do produto
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setViewModalOpen(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => window.location.href = `/dashboard/products/${product.id}/edit`}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar produto
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                <span className="text-red-600">Excluir produto</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewProductModal
            productId={product.id}
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
          />

          <DeleteProductModal
            productId={product.id}
            productTitle={product.title}
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )
    },
  },
]
