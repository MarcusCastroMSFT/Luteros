'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface ContactRespondedButtonProps {
  id: string
  responded: boolean
  variant?: 'outline' | 'default'
}

export function ContactRespondedButton({ id, responded, variant = 'outline' }: ContactRespondedButtonProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [refreshing, startRefresh] = useTransition()
  const busy = saving || refreshing

  async function toggle() {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responded: !responded }),
      })
      if (!response.ok) throw new Error('update failed')
      toast.success(responded ? 'Mensagem reaberta.' : 'Mensagem marcada como respondida.')
      startRefresh(() => router.refresh())
    } catch {
      toast.error('Não foi possível atualizar a mensagem. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Button type="button" size="sm" variant={responded ? 'outline' : variant} onClick={toggle} disabled={busy} className="cursor-pointer">
      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : responded ? <Undo2 className="size-4" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
      {responded ? 'Reabrir' : 'Marcar como respondida'}
    </Button>
  )
}
