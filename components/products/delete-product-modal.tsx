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

interface DeleteProductModalProps {
  productId: string
  productTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteProductModal({
  productId,
  productTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProductModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!productId) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete product')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting product:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete product')
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
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja excluir o produto{' '}
            <span className="font-semibold text-foreground">
              {productTitle}
            </span>
            ?
          </AlertDialogDescription>
          <div className="rounded-lg bg-yellow-50 p-3 mt-3">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. O produto e todas as
              estatísticas de uso associadas serão permanentemente removidos.
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
            {deleting ? 'Excluindo...' : 'Excluir Produto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
