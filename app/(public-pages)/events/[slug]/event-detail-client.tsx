'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/pageHeader'
import { EventInfo } from '@/components/events/eventInfo'
import { Speakers } from '@/components/common/speakers'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'
import { MapPin, Calendar, Clock } from 'lucide-react'
import { type Event } from '@/types/event'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface EventDetailClientProps {
  initialData: {
    event: Event
    relatedEvents: Event[]
  }
  slug: string
}

export function EventDetailClient({ initialData, slug }: EventDetailClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [eventData, setEventData] = useState(initialData)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const { event } = eventData

  // Check registration status on mount and when user changes
  useEffect(() => {
    if (user) {
      checkRegistrationStatus(event.id)
    } else {
      setIsCheckingRegistration(false)
      setIsRegistered(false)
    }
  }, [user, event.id])

  const checkRegistrationStatus = async (eventId: string) => {
    setIsCheckingRegistration(true)
    try {
      const response = await fetch(`/api/events/${eventId}/register`)
      const data = await response.json()
      
      if (data.success) {
        setIsRegistered(data.isRegistered)
      }
    } catch (error) {
      console.error('Error checking registration:', error)
    } finally {
      setIsCheckingRegistration(false)
    }
  }

  // Refresh event data (for slot count updates)
  const refreshEventData = async () => {
    try {
      const response = await fetch(`/api/events-public/${slug}`)
      const data = await response.json()
      if (data.success && data.data) {
        setEventData(data.data)
      }
    } catch (error) {
      console.error('Error refreshing event data:', error)
    }
  }

  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  const handleBookNow = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Você precisa estar logado para se inscrever no evento')
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    // Check if already registered
    if (isRegistered) {
      toast.info('Você já está inscrito neste evento')
      return
    }

    // Check if event is full
    if (event.bookedSlots >= event.totalSlots) {
      toast.error('Desculpe, este evento está lotado')
      return
    }

    setIsRegistering(true)

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.data.message)
        setIsRegistered(true)
        
        // Refresh event data to update booked slots
        await refreshEventData()
      } else {
        toast.error(data.error || 'Falha ao se inscrever no evento')
      }
    } catch (error) {
      console.error('Error registering for event:', error)
      toast.error('Ocorreu um erro ao processar sua inscrição')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!user) return

    setIsRegistering(true)

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Inscrição cancelada com sucesso')
        setIsRegistered(false)
        
        // Refresh event data to update booked slots
        await refreshEventData()
      } else {
        toast.error(data.error || 'Falha ao cancelar inscrição')
      }
    } catch (error) {
      console.error('Error cancelling registration:', error)
      toast.error('Ocorreu um erro ao cancelar sua inscrição')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <>
      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar Inscrição"
        description="Tem certeza de que deseja cancelar sua inscrição neste evento? Esta ação não pode ser desfeita."
        confirmText="Sim, cancelar"
        cancelText="Não, manter inscrição"
        onConfirm={handleCancelRegistration}
        variant="destructive"
      />
      
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <PageHeader
          title={event.title}
          description={event.description}
          align="left"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Eventos', href: '/events' },
            { label: event.title }
          ]}
        />
      
      <div className="container mx-auto px-4 max-w-[1428px] pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{event.time}</span>
              </div>
            </div>

            {/* Event Description Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Sobre o Evento
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {event.fullDescription || event.description}
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Event Content Section */}
            {event.content && event.content.length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Tópicos
                  </h2>
                  <ul className="space-y-3">
                    {event.content.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                        <span className="text-blue-600 font-bold text-lg">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Separator */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
              </>
            )}

            {/* Speakers Section */}
            {event.speakers && event.speakers.length > 0 && (
              <div>
                <Speakers speakers={event.speakers} />
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:-mt-52 relative z-10">
              <EventInfo
                image={event.image}
                cost={event.cost}
                totalSlots={event.totalSlots}
                bookedSlots={event.bookedSlots}
                onBookNow={handleBookNow}
                isRegistered={isRegistered}
                isRegistering={isRegistering}
                isCheckingRegistration={isCheckingRegistration}
                onCancelRegistration={() => setShowCancelDialog(true)}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
