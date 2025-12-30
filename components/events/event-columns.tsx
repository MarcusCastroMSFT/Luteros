"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Eye, Users, Edit, Trash2 } from "lucide-react"
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
import { ViewEventModal } from "./view-event-modal"
import { EditEventModal } from "./edit-event-modal"
import { DeleteEventModal } from "./delete-event-modal"
import { ViewRegistrationsModal } from "./view-registrations-modal"

export interface Event {
  id: string
  slug: string
  header: string
  type: string
  status: "Ativo" | "Cancelado" | "Pendente"
  isPublished: boolean
  location: string
  date: string
  time: string
  paid: "Gratuito" | "Pago"
  target: string
  limit: string
  reviewer: string
}

export const createEventColumns = (onUpdate?: () => void): ColumnDef<Event>[] => {
  return [
  {
    accessorKey: "header",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Evento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("header")}</div>
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
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("type")}</div>
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
            draft: "Pendente",
            inactive: "Cancelado"
          }}
        />
      )
    },
  },
  {
    accessorKey: "location",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Local
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">{row.getValue("location")}</div>
    ),
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
      const date = row.getValue("date") as string
      const formattedDate = new Date(date).toLocaleDateString('pt-BR')
      return <div className="whitespace-nowrap">{formattedDate}</div>
    },
  },
  {
    accessorKey: "time",
    header: "Horário",
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm">{row.getValue("time")}</div>
    ),
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
    accessorKey: "target",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Inscritos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const target = row.getValue("target") as string
      const limit = row.original.limit
      return (
        <div className="text-right font-medium">
          {target}/{limit}
        </div>
      )
    },
  },
  {
    accessorKey: "limit",
    header: "Limite",
    enableHiding: true,
    enableSorting: false,
    cell: ({ row }) => null,
  },
  {
    accessorKey: "reviewer",
    header: "Responsável",
    cell: ({ row }) => (
      <div>{row.getValue("reviewer")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const event = row.original
      const [viewModalOpen, setViewModalOpen] = useState(false)
      const [editModalOpen, setEditModalOpen] = useState(false)
      const [deleteModalOpen, setDeleteModalOpen] = useState(false)
      const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false)
      const meta = table.options.meta as { onDeleteEvent?: (eventId: string) => void } | undefined

      const handleDeleteSuccess = () => {
        onUpdate?.()
        meta?.onDeleteEvent?.(event.id)
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              {event.isPublished && event.slug && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir evento publicado
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="cursor-pointer" onClick={() => setViewModalOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              {parseInt(event.target) > 0 && (
                <DropdownMenuItem className="cursor-pointer" onClick={() => setRegistrationsModalOpen(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Ver inscritos
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer" onClick={() => setEditModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar evento
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400">Excluir evento</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewEventModal
            eventId={event.id}
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
          />

          <ViewRegistrationsModal
            eventId={event.id}
            eventTitle={event.header}
            open={registrationsModalOpen}
            onOpenChange={setRegistrationsModalOpen}
          />

          <EditEventModal
            eventId={event.id}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSuccess={onUpdate}
          />

          <DeleteEventModal
            eventId={event.id}
            eventTitle={event.header}
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )
    },
  },
]
}

// For backwards compatibility
export const eventColumns = createEventColumns()
