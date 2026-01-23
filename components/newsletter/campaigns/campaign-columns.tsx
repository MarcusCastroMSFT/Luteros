"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/badges/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  IconDotsVertical, 
  IconSend, 
  IconTrash, 
  IconEye,
  IconEdit,
  IconAlertCircle,
  IconMailForward,
} from "@tabler/icons-react"
import { DeleteCampaignModal } from "./delete-campaign-modal"
import { SendCampaignModal } from "./send-campaign-modal"
import { TestCampaignModal } from "./test-campaign-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface Campaign {
  id: string
  name: string
  subject: string
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"
  errorMessage: string | null
  scheduledAt: string | null
  sentAt: string | null
  totalRecipients: number
  sentCount: number
  failedCount: number
  createdBy: string
  createdAt: string
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

function getStatusValue(status: string): string {
  const statusMap: Record<string, string> = {
    'DRAFT': 'Rascunho',
    'SCHEDULED': 'Agendada',
    'SENDING': 'Enviando',
    'SENT': 'Enviada',
    'FAILED': 'Falhou',
  }
  return statusMap[status] || status
}

export function getCampaignColumns(
  onEdit: (campaign: Campaign) => void,
  onRefresh: () => void
): ColumnDef<Campaign>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {row.original.subject}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const displayValue = getStatusValue(status)
        const errorMessage = row.original.errorMessage
        
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge 
              value={displayValue}
              labels={{
                active: "Enviada",
                draft: "Rascunho",
                inactive: "Falhou",
              }}
            />
            {status === 'FAILED' && errorMessage && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-red-500 hover:text-red-600">
                      <IconAlertCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{errorMessage}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "sentCount",
      header: "Enviados",
      cell: ({ row }) => {
        const campaign = row.original
        if (campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="text-sm">
            <span className="font-medium">{campaign.sentCount}</span>
            {campaign.failedCount > 0 && (
              <span className="text-red-500 ml-1">
                ({campaign.failedCount} falhas)
              </span>
            )}
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
            Criada em
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      ),
    },
    {
      accessorKey: "sentAt",
      header: "Enviada em",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDateTime(row.original.sentAt)}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const campaign = row.original
        return (
          <CampaignActionsMenu 
            campaign={campaign} 
            onEdit={onEdit}
            onRefresh={onRefresh}
          />
        )
      },
    },
  ]
}

function CampaignActionsMenu({ 
  campaign, 
  onEdit,
  onRefresh,
}: { 
  campaign: Campaign
  onEdit: (campaign: Campaign) => void
  onRefresh: () => void
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)

  const canEdit = campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED'
  const canSend = campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED' || campaign.status === 'FAILED'
  const canDelete = campaign.status !== 'SENDING'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
            <span className="sr-only">Abrir menu</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => onEdit(campaign)}
          >
            {canEdit ? (
              <IconEdit className="mr-2 h-4 w-4" />
            ) : (
              <IconEye className="mr-2 h-4 w-4" />
            )}
            {canEdit ? 'Editar' : 'Visualizar'}
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setShowTestModal(true)}
          >
            <IconMailForward className="mr-2 h-4 w-4" />
            Enviar teste
          </DropdownMenuItem>

          {canSend && (
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => setShowSendModal(true)}
            >
              <IconSend className="mr-2 h-4 w-4" />
              Enviar agora
            </DropdownMenuItem>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={() => setShowDeleteModal(true)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCampaignModal
        campaignId={campaign.id}
        campaignName={campaign.name}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onSuccess={onRefresh}
      />

      <SendCampaignModal
        campaignId={campaign.id}
        campaignName={campaign.name}
        open={showSendModal}
        onOpenChange={setShowSendModal}
        onSuccess={onRefresh}
      />

      <TestCampaignModal
        campaignId={campaign.id}
        campaignName={campaign.name}
        open={showTestModal}
        onOpenChange={setShowTestModal}
      />
    </>
  )
}
