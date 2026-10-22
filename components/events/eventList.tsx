import React from 'react';
import { EventCard } from './eventCard';
import { type EventListProps } from '@/types/event';

export function EventList({ events = [], limit, className = '' }: EventListProps) {
  const displayedEvents = limit ? events.slice(0, limit) : events;

  if (displayedEvents.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">Nenhum evento encontrado.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {displayedEvents.map((event) => (
        <EventCard 
          key={event.id} 
          event={event}
        />
      ))}
    </div>
  );
}