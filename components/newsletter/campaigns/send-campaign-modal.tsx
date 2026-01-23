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
import { IconSend, IconLoader2, IconMail } from '@tabler/icons-react'
import { toast } from 'sonner'

interface SendCampaignModalProps {
  campaignId: string
  campaignName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SendCampaignModal({
  campaignId,
  campaignName,
  open,
  onOpenChange,
  onSuccess,
}: SendCampaignModalProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!campaignId) return

    setSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/newsletter/campaigns/${campaignId}/send`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar campanha')
      }

      toast.success('Campanha enviada com sucesso!', {
        description: `${data.stats.sent} emails enviados com sucesso.${data.stats.failed > 0 ? ` ${data.stats.failed} falhas.` : ''}`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error sending campaign:', error)
      setError(error instanceof Error ? error.message : 'Falha ao enviar campanha')
    } finally {
      setSending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <IconMail className="h-5 w-5 text-blue-600" />
            </div>
            <AlertDialogTitle>Enviar Campanha</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja enviar a campanha{' '}
            <span className="font-semibold text-foreground">
              {campaignName}
            </span>{' '}
            para todos os inscritos ativos?
          </AlertDialogDescription>
          <div className="rounded-lg bg-blue-50 p-3 mt-3">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Ao confirmar, a campanha será enviada imediatamente 
              para todos os inscritos ativos da newsletter. Esta ação não pode ser desfeita.
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
            disabled={sending}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              handleSend()
            }}
            disabled={sending}
          >
            {sending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <IconSend className="mr-2 h-4 w-4" />
                Enviar agora
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
