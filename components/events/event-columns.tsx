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

export interface Event {
  id: number
  header: string
  type: string
  status: "Active" | "Inactive" | "Pending"
  location: string
  date: string
  time: string
  paid: "Free" | "Paid"
  target: string
  limit: string
  reviewer: string
}

export const eventColumns: ColumnDef<Event>[] = [
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
            draft: "Pendente", // Map "Pending" to "Pendente"
            inactive: "Inativo"
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
      const limit = row.getValue("limit") as string
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
    cell: ({ row }) => {
      const limit = row.getValue("limit") as string
      return <div className="text-right">{limit}</div>
    },
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
    cell: ({ row }) => {
      const event = row.original

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
              onClick={() => navigator.clipboard.writeText(event.id.toString())}
            >
              Copiar ID do evento
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem>Editar evento</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Excluir evento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
