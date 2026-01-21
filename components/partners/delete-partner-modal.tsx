'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { PartnerRow } from './partner-columns'

interface DeletePartnerModalProps {
  partner: PartnerRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeletePartnerModal({
  partner,
  open,
  onOpenChange,
  onSuccess,
}: DeletePartnerModalProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!partner.id) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/partners/${partner.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete partner')
      }

      toast.success('Parceiro excluído com sucesso!')
      onSuccess?.()
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting partner:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete partner'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const hasProducts = partner.productsCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <IconAlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Excluir Parceiro</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja excluir o parceiro{' '}
            <span className="font-semibold text-foreground">
              {partner.name}
            </span>
            ?
          </AlertDialogDescription>
          
          {hasProducts && (
            <div className="rounded-lg bg-red-50 p-3 mt-3">
              <p className="text-sm text-red-800">
                <strong>Atenção:</strong> Este parceiro possui{' '}
                <span className="font-semibold">{partner.productsCount}</span>{' '}
                {partner.productsCount === 1 ? 'produto associado' : 'produtos associados'}.
                Todos os produtos serão excluídos junto com o parceiro.
              </p>
            </div>
          )}
          
          <div className="rounded-lg bg-yellow-50 p-3 mt-3">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Esta ação não pode ser desfeita.
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
              'Sim, excluir parceiro'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
