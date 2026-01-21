'use client';

import { useEffect, useState } from 'react';
import { Loader2, Calendar, Clock, MapPin, Users, DollarSign, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/common/badges/status-badge';
import { PaidBadge } from '@/components/common/badges/paid-badge';
import Image from 'next/image';

interface EventSpeaker {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface EventDetails {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: string;
  location: string;
  eventDate: string;
  eventTime: string;
  duration?: number;
  image?: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  cost?: string;
  isFree: boolean;
  isPublished: boolean;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
  speakers: EventSpeaker[];
  stats: {
    totalRegistrations: number;
    attendedCount: number;
    attendanceRate: string;
    occupancyRate: string;
  };
}

interface ViewEventModalProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Cache events in memory to avoid refetching on every open
const eventCache = new Map<string, EventDetails>();

export function ViewEventModal({
  eventId,
  open,
  onOpenChange,
}: ViewEventModalProps) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && eventId) {
      // Check cache first
      const cached = eventCache.get(eventId);
      if (cached) {
        setEvent(cached);
        setLoading(false);
        return;
      }
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao buscar evento');
      }

      // Cache the event for future opens
      eventCache.set(eventId, data.data);
      setEvent(data.data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Falha ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatCurrency = (value?: string) => {
    if (!value) return 'R$ 0,00';
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Evento</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {event && !loading && !error && (
            <div className="space-y-6">
              {/* Status Alerts */}
              {!event.isPublished && (
                <Alert className="border-amber-500 bg-amber-50">
                  <AlertDescription className="text-amber-800 font-medium">
                    ⚠️ Este evento não está publicado e não está visível publicamente.
                  </AlertDescription>
                </Alert>
              )}

              {event.isCancelled && (
                <Alert variant="destructive">
                  <AlertDescription className="font-medium">
                    Este evento foi cancelado.
                  </AlertDescription>
                </Alert>
              )}

              {/* Event Image */}
              {event.image && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title and Badges */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                <div className="flex gap-2">
                  <StatusBadge 
                    value={event.isCancelled ? "Cancelado" : event.isPublished ? "Ativo" : "Pendente"}
                    labels={{
                      active: "Ativo",
                      draft: "Pendente",
                      inactive: "Cancelado"
                    }}
                  />
                  <PaidBadge value={event.isFree ? "Gratuito" : "Pago"} />
                </div>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Data</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.eventDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Horário</p>
                    <p className="text-sm text-muted-foreground">
                      {event.eventTime}
                      {event.duration && ` (${event.duration} min)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Local</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Vagas</p>
                    <p className="text-sm text-muted-foreground">
                      {event.bookedSlots} / {event.totalSlots} inscritos
                      <span className="ml-2 text-xs">
                        ({event.availableSlots} disponíveis)
                      </span>
                    </p>
                  </div>
                </div>

                {!event.isFree && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Investimento</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(event.cost)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {event.fullDescription || event.description}
                </p>
              </div>

              {/* Speakers */}
              {event.speakers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Palestrantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.speakers.map((speaker) => (
                      <div key={speaker.id} className="flex gap-4 p-4 border rounded-lg">
                        {speaker.image && (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={speaker.image}
                              alt={speaker.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {!speaker.image && (
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{speaker.name}</h4>
                          {speaker.title && (
                            <p className="text-sm text-muted-foreground">{speaker.title}</p>
                          )}
                          {speaker.bio && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {speaker.bio}
                            </p>
                          )}
                          {(speaker.linkedin || speaker.twitter || speaker.website) && (
                            <div className="flex gap-2 mt-2">
                              {speaker.linkedin && (
                                <a 
                                  href={speaker.linkedin} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                              {speaker.twitter && (
                                <a 
                                  href={speaker.twitter} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  Twitter
                                </a>
                              )}
                              {speaker.website && (
                                <a 
                                  href={speaker.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  Website
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total de Inscrições</p>
                    <p className="text-2xl font-bold">{event.stats.totalRegistrations}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Compareceram</p>
                    <p className="text-2xl font-bold">{event.stats.attendedCount}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa de Presença</p>
                    <p className="text-2xl font-bold">{event.stats.attendanceRate}%</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                    <p className="text-2xl font-bold">{event.stats.occupancyRate}%</p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex gap-4">
                    <span>Criado em: {formatDate(event.createdAt)}</span>
                    <span>Atualizado em: {formatDate(event.updatedAt)}</span>
                  </div>
                  <span className="font-mono">ID: {event.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
