'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/common/pageHeader';
import { EventInfo } from '@/components/events/eventInfo';
import { Speakers } from '@/components/common/speakers';
import { EventDetailSkeleton } from '@/components/events/eventDetailSkeleton';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { type Event, type EventApiResponse } from '@/types/event';

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
  const [eventData, setEventData] = useState<{ event: Event; relatedEvents: Event[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      
      const data = await getEvent(slug);
      
      if (data) {
        setEventData(data);
      } else {
        setError('Event not found');
      }
      
      setIsLoading(false);
    };

    fetchEvent();
  }, [slug]);

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

  const handleBookNow = () => {
    // Handle booking logic
    console.log('Book now clicked for event:', event.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{/* Page Header */}
      <PageHeader
        title={event.title}
        description={event.description}
        align="left"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Events', href: '/events' },
          { label: 'Instructor' }
        ]}
      />
      
      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}