'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { EventList } from '@/components/events/eventList';
import { Pagination } from '@/components/common/pagination';
import { Input } from '@/components/ui/input';
import { type Event, type EventsPagination } from '@/types/event';

interface EventsPageClientProps {
  events: Event[];
  pagination: EventsPagination;
  activeSearch: string;
}

export function EventsPageClient({ events, pagination, activeSearch }: EventsPageClientProps) {
  const router = useRouter();
  // Local input state so typing isn't gated on round-trips; we debounce-commit to the URL.
  const [searchInput, setSearchInput] = useState(activeSearch);

  const buildUrl = (page: number, search: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (search.trim()) params.set('search', search.trim());
    const qs = params.toString();
    return qs ? `/events?${qs}` : '/events';
  };

  // Debounce: commit the typed search to the URL 300ms after the last keystroke
  useEffect(() => {
    if (searchInput === activeSearch) return;
    const timeoutId = setTimeout(() => {
      router.push(buildUrl(1, searchInput));
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handlePageChange = (page: number) => {
    router.push(buildUrl(page, activeSearch));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar eventos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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

      {/* Events List */}
      {events.length > 0 ? (
        <>
          <EventList events={events} />

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
            {activeSearch ? 'Nenhum evento encontrado com os termos de busca.' : 'Nenhum evento disponível no momento.'}
          </p>
          {activeSearch && (
            <button
              onClick={() => setSearchInput('')}
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
