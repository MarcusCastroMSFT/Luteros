"use client"

import { useState, createContext, useContext, useCallback, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "@/components/common/badges/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconDotsVertical, IconMailX, IconMailCheck, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

export interface Subscriber {
  id: string
  email: string
  status: "Ativo" | "Pendente" | "Cancelado"
  source: string
  confirmedAt: string | null
  unsubscribedAt: string | null
  createdAt: string
}

// Context for managing subscriber status updates
interface SubscriberStatusContextType {
  statusOverrides: Map<string, string>
  setStatusOverride: (id: string, status: string) => void
  removeStatusOverride: (id: string) => void
}

const SubscriberStatusContext = createContext<SubscriberStatusContextType | null>(null)

export function SubscriberStatusProvider({ children }: { children: React.ReactNode }) {
  const [statusOverrides, setStatusOverrides] = useState<Map<string, string>>(new Map())

  const setStatusOverride = useCallback((id: string, status: string) => {
    setStatusOverrides(prev => {
      const next = new Map(prev)
      next.set(id, status)
      return next
    })
  }, [])

  const removeStatusOverride = useCallback((id: string) => {
    setStatusOverrides(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const value = useMemo(() => ({
    statusOverrides,
    setStatusOverride,
    removeStatusOverride,
  }), [statusOverrides, setStatusOverride, removeStatusOverride])

  return (
    <SubscriberStatusContext.Provider value={value}>
      {children}
    </SubscriberStatusContext.Provider>
  )
}

function useSubscriberStatus() {
  const context = useContext(SubscriberStatusContext)
  if (!context) {
    throw new Error('useSubscriberStatus must be used within a SubscriberStatusProvider')
  }
  return context
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getSubscriberColumns(onSubscriberUpdated?: () => void): ColumnDef<Subscriber>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
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
      cell: ({ row }) => (
        <div className="font-medium lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <SubscriberStatusCell subscriber={row.original} />
      },
    },
    {
      accessorKey: "source",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Origem
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const source = row.getValue("source") as string
        const sourceLabels: Record<string, string> = {
          'footer': 'Rodapé',
          'popup': 'Pop-up',
          'landing': 'Landing Page',
          'blog': 'Blog',
          'checkout': 'Checkout',
        }
        return (
          <div className="text-sm capitalize">
            {sourceLabels[source] || source}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data de Inscrição
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDateTime(row.getValue("createdAt"))}
        </div>
      ),
    },
    {
      accessorKey: "confirmedAt",
      header: "Confirmado em",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("confirmedAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const subscriber = row.original
        return (
          <SubscriberActionsMenu subscriber={subscriber} />
        )
      },
    },
  ]
}

// For backward compatibility
export const subscriberColumns = getSubscriberColumns()

// Status cell component that uses context for optimistic updates
function SubscriberStatusCell({ subscriber }: { subscriber: Subscriber }) {
  const { statusOverrides } = useSubscriberStatus()
  const displayStatus = statusOverrides.get(subscriber.id) || subscriber.status
  
  return (
    <StatusBadge 
      value={displayStatus}
      labels={{
        active: "Ativo",
        draft: "Pendente",
        inactive: "Cancelado",
      }}
    />
  )
}

// Separate component for actions menu
function SubscriberActionsMenu({ 
  subscriber, 
}: { 
  subscriber: Subscriber
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { statusOverrides, setStatusOverride, removeStatusOverride } = useSubscriberStatus()
  
  const currentStatus = statusOverrides.get(subscriber.id) || subscriber.status

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'UNSUBSCRIBED') => {
    const displayStatus = newStatus === 'ACTIVE' ? 'Ativo' : 'Cancelado'
    const previousStatus = currentStatus
    const isReactivating = newStatus === 'ACTIVE'
    
    // Optimistic update
    setIsLoading(true)
    setStatusOverride(subscriber.id, displayStatus)
    
    try {
      const response = await fetch(`/api/newsletter/subscribers/${subscriber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        // Revert on error
        if (previousStatus === subscriber.status) {
          removeStatusOverride(subscriber.id)
        } else {
          setStatusOverride(subscriber.id, previousStatus)
        }
        toast.error('Erro ao atualizar inscrição', {
          description: 'Não foi possível atualizar o status. Tente novamente.',
        })
      } else {
        toast.success(
          isReactivating ? 'Inscrição reativada' : 'Inscrição cancelada',
          {
            description: isReactivating 
              ? `${subscriber.email} foi reativado na newsletter.`
              : `${subscriber.email} foi removido da newsletter.`,
          }
        )
      }
    } catch (error) {
      // Revert on error
      if (previousStatus === subscriber.status) {
        removeStatusOverride(subscriber.id)
      } else {
        setStatusOverride(subscriber.id, previousStatus)
      }
      toast.error('Erro ao atualizar inscrição', {
        description: 'Ocorreu um erro inesperado. Tente novamente.',
      })
      console.error('Error updating subscriber:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer" disabled={isLoading}>
          <span className="sr-only">Abrir menu</span>
          {isLoading ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconDotsVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === 'Cancelado' ? (
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={isLoading}
          >
            <IconMailCheck className="mr-2 h-4 w-4" />
            Reativar inscrição
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            className="text-red-600 cursor-pointer"
            onClick={() => handleStatusChange('UNSUBSCRIBED')}
            disabled={isLoading}
          >
            <IconMailX className="mr-2 h-4 w-4" />
            Cancelar inscrição
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}