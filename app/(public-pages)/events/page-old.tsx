'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/common/pageHeader';
import { EventList } from '@/components/events/eventList';
import { EventListSkeleton } from '@/components/events/eventSkeleton';
import { Pagination } from '@/components/common/pagination';
import { Input } from '@/components/ui/input';
import { sampleEvents } from '@/data/events';

const EVENTS_PER_PAGE = 9;

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter events based on search term
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return sampleEvents;
    
    return sampleEvents.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Paginate filtered events
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Simulate loading when searching
  React.useEffect(() => {
    if (searchTerm) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 pb-16">
      <PageHeader
        title="Eventos"
        description="Participe de nossos eventos e workshops sobre saúde sexual e bem-estar."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Eventos' }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            {filteredEvents.length === 0 
              ? 'Nenhum evento encontrado'
              : `${filteredEvents.length} evento${filteredEvents.length !== 1 ? 's' : ''} encontrado${filteredEvents.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Events List or Skeleton */}
        {isLoading ? (
          <EventListSkeleton count={EVENTS_PER_PAGE} />
        ) : filteredEvents.length > 0 ? (
          <>
            <EventList events={paginatedEvents} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nenhum evento encontrado com os termos de busca.
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[var(--cta-highlight)] hover:underline"
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}