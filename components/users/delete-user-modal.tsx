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

interface DeleteUserModalProps {
  userId: string | null
  userName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteUserModal({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!userId) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete user')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete user')
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
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja excluir o usuário{' '}
            <span className="font-semibold text-foreground">
              {userName || 'este usuário'}
            </span>
            ?
          </AlertDialogDescription>
          <div className="rounded-lg bg-yellow-50 p-3 mt-3">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os dados
              relacionados ao usuário, incluindo cursos, comentários e progresso serão
              permanentemente removidos.
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
            {deleting ? 'Excluindo...' : 'Excluir Usuário'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
