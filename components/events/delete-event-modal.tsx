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

interface DeleteEventModalProps {
  eventId: string
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteEventModal({
  eventId,
  eventTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteEventModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!eventId) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao excluir evento')
      }

      toast.success('Evento excluído com sucesso!')
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting event:', error)
      const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir evento'
      setError(errorMessage)
      toast.error(errorMessage)
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
            <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja excluir o evento{' '}
            <span className="font-semibold text-foreground">
              {eventTitle}
            </span>
            ?
          </AlertDialogDescription>
          <div className="rounded-lg bg-yellow-50 p-3 mt-3">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. O evento e todas as
              inscrições, palestrantes e estatísticas associadas serão permanentemente removidos.
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
            {deleting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {deleting ? 'Excluindo...' : 'Excluir Evento'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
