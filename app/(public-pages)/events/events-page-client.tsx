'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Search } from 'lucide-react';
import { EventList } from '@/components/events/eventList';
import { EventListSkeleton } from '@/components/events/eventSkeleton';
import { Pagination } from '@/components/common/pagination';
import { Input } from '@/components/ui/input';
import { type Event, type EventsApiResponse, type EventsPagination } from '@/types/event';

const EVENTS_PER_PAGE = 9;

interface EventsPageClientProps {
  initialEvents: Event[];
  initialPagination: EventsPagination;
}

export function EventsPageClient({ initialEvents, initialPagination }: EventsPageClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [pagination, setPagination] = useState<EventsPagination>(initialPagination);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (page: number = 1, search: string = '') => {
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: EVENTS_PER_PAGE.toString(),
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/events-public?${params}`);
      const data: EventsApiResponse = await response.json();

      if (data.success && data.data) {
        setEvents(data.data.events);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Erro ao carregar eventos');
      }
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error('Error fetching events:', err);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    if (searchTerm === '' && currentPage === 1) {
      // Reset to initial data when search is cleared
      setEvents(initialEvents);
      setPagination(initialPagination);
      return;
    }

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        fetchEvents(1, searchTerm);
        setCurrentPage(1);
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, initialEvents, initialPagination]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    startTransition(() => {
      fetchEvents(page, searchTerm);
    });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => fetchEvents(currentPage, searchTerm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {pagination.totalEvents === 0 
            ? 'Nenhum evento encontrado'
            : `${pagination.totalEvents} evento${pagination.totalEvents !== 1 ? 's' : ''} encontrado${pagination.totalEvents !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Events List or Skeleton */}
      {isPending ? (
        <EventListSkeleton count={EVENTS_PER_PAGE} />
      ) : events.length > 0 ? (
        <>
          <EventList events={events} />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Nenhum evento encontrado com os termos de busca.' : 'Nenhum evento disponível no momento.'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => handleSearchChange('')}
              className="text-[var(--cta-highlight)] hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
}
