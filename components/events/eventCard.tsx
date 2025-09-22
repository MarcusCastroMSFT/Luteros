import React from 'react';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type EventCardProps } from '@/types/event';

export function EventCard({ event, className = '' }: EventCardProps) {
  return (
    <Card className={`overflow-hidden py-0 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer h-full ${className}`}>
      <CardContent className="p-6 bg-white dark:bg-gray-800 h-full flex flex-col">
        {/* Location and Time Row */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Event Title */}
        <Link href={`/events/${event.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight mb-3 hover:text-primary transition-colors cursor-pointer">
            {event.title}
          </h3>
        </Link>

        {/* Description if provided */}
        {event.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 flex-1">
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