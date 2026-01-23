'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'

interface DeleteCampaignModalProps {
  campaignId: string
  campaignName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteCampaignModal({
  campaignId,
  campaignName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCampaignModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!campaignId) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/newsletter/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Falha ao excluir campanha')
      }

      toast.success('Campanha excluída com sucesso')
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting campaign:', error)
      setError(error instanceof Error ? error.message : 'Falha ao excluir campanha')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <IconAlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Excluir Campanha</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja excluir a campanha{' '}
            <span className="font-semibold text-foreground">
              {campaignName}
            </span>
            ?
          </AlertDialogDescription>
          <div className="rounded-lg bg-yellow-50 p-3 mt-3">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. A campanha e todas as
              estatísticas de envio associadas serão permanentemente removidas.
            </p>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 mt-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer"
            disabled={deleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
