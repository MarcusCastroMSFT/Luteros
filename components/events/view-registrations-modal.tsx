"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Registration {
  id: string
  user: {
    fullName: string | null
    displayName: string | null
    email: string
  }
  registeredAt: string
  attended: boolean
  paidAmount: number | null
  paymentStatus: string | null
}

interface ViewRegistrationsModalProps {
  eventId: string
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewRegistrationsModal({
  eventId,
  eventTitle,
  open,
  onOpenChange,
}: ViewRegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && eventId) {
      fetchRegistrations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId])

  const fetchRegistrations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}/registrations`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch registrations')
      }

      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (err) {
      console.error('Error fetching registrations:', err)
      setError('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatusBadge = (status: string | null) => {
    if (!status) return null
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      COMPLETED: "default",
      PENDING: "secondary",
      REFUNDED: "destructive",
    }

    const labels: Record<string, string> = {
      COMPLETED: "Pago",
      PENDING: "Pendente",
      REFUNDED: "Reembolsado",
    }

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscritos - {eventTitle}</DialogTitle>
          <DialogDescription>
            {!loading && registrations.length > 0 && (
              <span>{registrations.length} {registrations.length === 1 ? 'pessoa inscrita' : 'pessoas inscritas'}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma inscrição encontrada
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Inscrição</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => {
                  const displayName = registration.user.displayName || 
                                     registration.user.fullName || 
                                     registration.user.email.split('@')[0]
                  
                  const registeredDate = new Date(registration.registeredAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })

                  return (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">{displayName}</TableCell>
                      <TableCell>{registration.user.email}</TableCell>
                      <TableCell>{registeredDate}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(registration.paymentStatus)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
