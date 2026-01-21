import React from 'react';
import { EventCard } from './eventCard';
import { type EventListProps } from '@/types/event';

export function EventList({ events = [], limit, className = '' }: EventListProps) {
  const displayedEvents = limit ? events.slice(0, limit) : events;

  if (displayedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No events found.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {displayedEvents.map((event) => (
        <EventCard 
          key={event.id} 
          event={event}
        />
      ))}
    </div>
  );
}