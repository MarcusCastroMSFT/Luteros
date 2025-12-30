'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/pageHeader';
import { EventInfo } from '@/components/events/eventInfo';
import { Speakers } from '@/components/common/speakers';
import { EventDetailSkeleton } from '@/components/events/eventDetailSkeleton';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { type Event, type EventApiResponse } from '@/types/event';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getEvent(slug: string) {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/events-public/${slug}`, {
      cache: 'no-store', // Ensure fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data: EventApiResponse = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default function EventPage({ params }: EventPageProps) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [eventData, setEventData] = useState<{ event: Event; relatedEvents: Event[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      
      const data = await getEvent(slug);
      
      if (data) {
        setEventData(data);
        
        // Check if user is already registered
        if (user) {
          checkRegistrationStatus(data.event.id);
        } else {
          // If no user, no need to check registration
          setIsCheckingRegistration(false);
        }
      } else {
        setError('Event not found');
      }
      
      setIsLoading(false);
    };

    fetchEvent();
  }, [slug, user]);

  const checkRegistrationStatus = async (eventId: string) => {
    setIsCheckingRegistration(true);
    try {
      const response = await fetch(`/api/events/${eventId}/register`);
      const data = await response.json();
      
      if (data.success) {
        setIsRegistered(data.isRegistered);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (error || !eventData) {
    notFound();
  }

  const { event } = eventData;

  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleBookNow = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Você precisa estar logado para se inscrever no evento');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!eventData) return;

    // Check if already registered
    if (isRegistered) {
      toast.info('Você já está inscrito neste evento');
      return;
    }

    // Check if event is full
    if (eventData.event.bookedSlots >= eventData.event.totalSlots) {
      toast.error('Desculpe, este evento está lotado');
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch(`/api/events/${eventData.event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.data.message);
        setIsRegistered(true);
        
        // Refresh event data to update booked slots
        const updatedData = await getEvent(slug);
        if (updatedData) {
          setEventData(updatedData);
        }
      } else {
        toast.error(data.error || 'Falha ao se inscrever no evento');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Ocorreu um erro ao processar sua inscrição');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!eventData || !user) return;

    setIsRegistering(true);

    try {
      const response = await fetch(`/api/events/${eventData.event.id}/register`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Inscrição cancelada com sucesso');
        setIsRegistered(false);
        
        // Refresh event data to update booked slots
        const updatedData = await getEvent(slug);
        if (updatedData) {
          setEventData(updatedData);
        }
      } else {
        toast.error(data.error || 'Falha ao cancelar inscrição');
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Ocorreu um erro ao cancelar sua inscrição');
    } finally {
      setIsRegistering(false);
    }
  };

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
  );
}