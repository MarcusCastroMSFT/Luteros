'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type RegisteredEvent } from '@/app/api/users/registered-events/route';

interface RegisteredEventCardProps {
  registration: RegisteredEvent;
}

export function RegisteredEventCard({ registration }: RegisteredEventCardProps) {
  const { event, attended, registeredAt } = registration;
  
  // Check if event is in the past
  const isPast = new Date(event.eventDate) < new Date();
  const isCancelled = event.isCancelled;

  // Format registration date
  const formatRegisteredAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate available slots


  return (
    <div className="group overflow-hidden rounded-[12px_36px_12px_12px] border border-brand-600/15 bg-white/60 transition-colors hover:bg-[#e4eeeb]/40 motion-reduce:transition-none">
      {/* Event Image */}
      <Link href={`/events/${event.slug}`} className="block relative">
        <div className="relative h-40 overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isCancelled ? (
              <Badge className="bg-red-500 hover:bg-red-600 text-white">
                <XCircle className="w-3 h-3 mr-1" />
                Cancelado
              </Badge>
            ) : isPast ? (
              attended ? (
                <Badge className="bg-brand-600 hover:bg-brand-700 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Participou
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-500 text-white">
                  Encerrado
                </Badge>
              )
            ) : (
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                Inscrito
              </Badge>
            )}
          </div>
          {/* Free badge */}
          {event.isFree && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-brand-600 hover:bg-brand-700 text-white">
                Gratuito
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Event Content */}
      <div className="p-5">
        {/* Date & Time */}
        <div className="flex items-center gap-2 mb-2 text-sm text-primary font-medium">
          <Calendar className="w-4 h-4" />
          <span>{event.eventDate}</span>
          <span className="text-gray-400">•</span>
          <span>{event.eventTime}</span>
        </div>

        {/* Title */}
        <Link href={`/events/${event.slug}`}>
          <h3 className="mb-2 line-clamp-2 font-[family-name:var(--font-cardo)] text-2xl leading-tight text-brand-900 group-hover:text-brand-700 motion-reduce:transition-none">
            {event.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Event Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{event.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{event.registeredCount}/{event.totalSlots}</span>
          </div>
        </div>

        {/* Registration Info & CTA */}
        <div className="flex items-center justify-between border-t border-brand-600/15 pt-3">
          <div className="text-xs text-gray-500">
            Inscrito em {formatRegisteredAt(registeredAt)}
          </div>
          <Button 
            asChild 
            size="sm" 
            variant={isPast || isCancelled ? 'outline' : 'default'}
            disabled={isCancelled}
          >
            <Link href={`/events/${event.slug}`} className="flex items-center gap-1">
              {isCancelled ? 'Ver detalhes' : isPast ? 'Ver evento' : 'Ver detalhes'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
