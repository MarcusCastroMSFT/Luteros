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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconMailForward, IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'

interface TestCampaignModalProps {
  campaignId: string
  campaignName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TestCampaignModal({
  campaignId,
  campaignName,
  open,
  onOpenChange,
}: TestCampaignModalProps) {
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSendTest = async () => {
    if (!campaignId) return

    if (!email) {
      setError('Digite um email para enviar o teste')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Digite um email válido')
      return
    }

    setSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/newsletter/campaigns/${campaignId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar email de teste')
      }

      toast.success('Email de teste enviado!', {
        description: `Verifique a caixa de entrada de ${email}`,
      })
      onOpenChange(false)
      setEmail('')
    } catch (error) {
      console.error('Error sending test email:', error)
      setError(error instanceof Error ? error.message : 'Falha ao enviar email de teste')
    } finally {
      setSending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <IconMailForward className="h-5 w-5 text-purple-600" />
            </div>
            <AlertDialogTitle>Enviar Email de Teste</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Envie um email de teste da campanha{' '}
            <span className="font-semibold text-foreground">
              {campaignName}
            </span>{' '}
            para verificar como ficará antes de enviar para todos os inscritos.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="test-email">Email para teste</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            className="mt-2"
            disabled={sending}
          />
          <p className="text-xs text-muted-foreground mt-2">
            O assunto terá o prefixo [TESTE] para fácil identificação.
          </p>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 mt-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer"
            disabled={sending}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              handleSendTest()
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
                <IconMailForward className="mr-2 h-4 w-4" />
                Enviar Teste
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
