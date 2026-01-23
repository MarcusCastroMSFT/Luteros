"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Star, ExternalLink, Eye, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
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
import { DeleteCourseModal } from "./delete-course-modal"

export interface CourseRow {
  id: string
  title: string
  instructor: string
  instructorTitle: string
  category: string
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
  studentsCount: number
  rating: number
  reviewsCount: number
  price: number
  originalPrice?: number
  lessonsCount: number
  duration: string
  status: 'Ativo' | 'Rascunho' | 'Inativo'
  isBestSeller?: boolean
  lastUpdated: string
  slug: string
}

const formatPrice = (price: number) => {
  if (price === 0) return 'Grátis'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

const formatStudentsCount = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

export const coursesColumns: ColumnDef<CourseRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Curso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium max-w-[300px]">
        <div className="flex items-center gap-2">
          <span className="truncate">{row.getValue("title")}</span>
          {row.original.isBestSeller && (
            <Badge variant="secondary" className="text-xs bg-brand-100 text-brand-700">
              Best Seller
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {row.original.category}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "instructor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Instrutor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="font-medium truncate">{row.getValue("instructor")}</div>
        <div className="text-sm text-muted-foreground truncate">
          {row.original.instructorTitle}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "level",
    header: "Nível",
    cell: ({ row }) => {
      const level = row.getValue("level") as string
      const levelColors = {
        'Iniciante': 'bg-green-100 text-green-700',
        'Intermediário': 'bg-yellow-100 text-yellow-700',
        'Avançado': 'bg-red-100 text-red-700'
      }
      
      return (
        <Badge variant="secondary" className={levelColors[level as keyof typeof levelColors]}>
          {level}
        </Badge>
      )
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Avaliação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{row.getValue("rating")}</span>
        <span className="text-sm text-muted-foreground">
          ({formatStudentsCount(row.original.reviewsCount)})
        </span>
      </div>
    ),
  },
  {
    accessorKey: "studentsCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Alunos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {formatStudentsCount(row.getValue("studentsCount"))}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Preço
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      const originalPrice = row.original.originalPrice
      
      return (
        <div className="text-right">
          <div className="font-medium">{formatPrice(price)}</div>
          {originalPrice && originalPrice > price && (
            <div className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "lessonsCount",
    header: "Aulas",
    cell: ({ row }) => (
      <div className="text-center">
        <div className="font-medium">{row.getValue("lessonsCount")}</div>
        <div className="text-sm text-muted-foreground">{row.original.duration}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <StatusBadge value={status} />
    },
  },
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Atualizado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("lastUpdated")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: function ActionsCell({ row, table }) {
      const course = row.original
      const [deleteModalOpen, setDeleteModalOpen] = useState(false)

      const handleDeleteSuccess = () => {
        // Optimistically update UI by removing the course
        const meta = table.options.meta as { onDeleteRow?: (id: string) => void }
        meta?.onDeleteRow?.(course.id)
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
              {course.status !== "Rascunho" && course.slug && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => window.open(`/courses/${course.slug}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir curso publicado
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => window.location.href = `/admin/courses/${course.id}/edit`}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar curso
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(course.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Copiar ID do curso
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                <span className="text-red-600">Excluir curso</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteCourseModal
            courseId={course.id}
            courseTitle={course.title}
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )
    },
  },
]
