import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PaidBadge } from '@/components/common/badges/paid-badge';
import { type EventCardProps } from '@/types/event';

export function EventCard({ event, className = '' }: EventCardProps) {
  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Card className={`overflow-hidden py-0 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer h-full ${className}`}>
      <CardContent className="p-6 bg-white h-full flex flex-col">
        {/* First Row: Location and Price Badge */}
        <div className="flex items-center justify-between gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <PaidBadge value={event.isFree ? "Gratuito" : "Pago"} />
        </div>

        {/* Second Row: Date and Time */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Event Title */}
        <Link href={`/events/${event.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-3 hover:text-primary transition-colors cursor-pointer">
            {event.title}
          </h3>
        </Link>

        {/* Description if provided */}
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">
            {event.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Export the Event type for use in other components
// Export types for backward compatibility
export type { Event, EventCardProps } from '@/types/event';