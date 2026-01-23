"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconMailForward,
  IconRefresh,
  IconUserCheck,
  IconLock,
  IconBell,
  IconCreditCard,
  IconHeart,
  IconPlayerPlay,
  IconPlayerPause,
  IconTrash,
} from "@tabler/icons-react"

export interface SystemEmailTemplate {
  id: string
  code: string
  name: string
  description: string | null
  category: 'AUTHENTICATION' | 'ACCOUNT' | 'NOTIFICATION' | 'TRANSACTION' | 'ENGAGEMENT'
  subject: string
  previewText: string | null
  htmlContent: string
  textContent: string | null
  variables: string[]
  isActive: boolean
  updatedById: string | null
  createdAt: string
  updatedAt: string
  updatedBy?: {
    id: string
    fullName: string | null
    displayName: string | null
  } | null
}

const categoryConfig: Record<string, { label: string; icon: typeof IconUserCheck; color: string; badgeColor: string }> = {
  AUTHENTICATION: { 
    label: 'Autenticação', 
    icon: IconLock, 
    color: 'bg-blue-500 text-white',
    badgeColor: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
  },
  ACCOUNT: { 
    label: 'Conta', 
    icon: IconUserCheck, 
    color: 'bg-violet-500 text-white',
    badgeColor: 'bg-violet-600 text-white hover:bg-violet-700 border-violet-600'
  },
  NOTIFICATION: { 
    label: 'Notificação', 
    icon: IconBell, 
    color: 'bg-orange-500 text-white',
    badgeColor: 'bg-orange-600 text-white hover:bg-orange-700 border-orange-600'
  },
  TRANSACTION: { 
    label: 'Transação', 
    icon: IconCreditCard, 
    color: 'bg-emerald-500 text-white',
    badgeColor: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
  },
  ENGAGEMENT: { 
    label: 'Engajamento', 
    icon: IconHeart, 
    color: 'bg-rose-500 text-white',
    badgeColor: 'bg-rose-600 text-white hover:bg-rose-700 border-rose-600'
  },
}

export function getTemplateColumns(
  onEdit: (template: SystemEmailTemplate) => void,
  onPreview: (template: SystemEmailTemplate) => void,
  onSendTest: (template: SystemEmailTemplate) => void,
  onReset: (template: SystemEmailTemplate) => void,
  onToggleActive: (template: SystemEmailTemplate) => void,
  onDelete: (template: SystemEmailTemplate) => void
): ColumnDef<SystemEmailTemplate>[] {
  return [
    {
      accessorKey: "name",
      header: "Template",
      cell: ({ row }) => {
        const template = row.original
        const config = categoryConfig[template.category]
        const Icon = config?.icon || IconBell

        return (
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config?.color || 'bg-muted'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{template.name}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                {template.description}
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                {template.code}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        const config = categoryConfig[row.original.category]
        return (
          <Badge className={config?.badgeColor}>
            {config?.label || row.original.category}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "subject",
      header: "Assunto",
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate text-sm">
          {row.original.subject}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Última Atualização",
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt)
        const updatedBy = row.original.updatedBy
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString('pt-BR')}</div>
            {updatedBy && (
              <div className="text-xs text-muted-foreground">
                por {updatedBy.displayName || updatedBy.fullName}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const template = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(template)} className="cursor-pointer">
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(template)} className="cursor-pointer">
                <IconEye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleActive(template)} className="cursor-pointer">
                {template.isActive ? (
                  <>
                    <IconPlayerPause className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <IconPlayerPlay className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendTest(template)} className="cursor-pointer" disabled={!template.isActive}>
                <IconMailForward className="mr-2 h-4 w-4" />
                Enviar Teste
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onReset(template)} className="cursor-pointer">
                <IconRefresh className="mr-2 h-4 w-4" />
                Restaurar Padrão
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(template)} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
