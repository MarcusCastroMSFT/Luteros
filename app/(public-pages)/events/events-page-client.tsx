'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { EventList } from '@/components/events/eventList';
import { Pagination } from '@/components/common/pagination';
import { EmptyState } from '@/components/common/empty-state';
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
    <div className="mx-auto max-w-[1480px] px-6 pb-20 pt-6 sm:px-10 lg:px-12">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-600" />
          <Input
            type="search"
            aria-label="Buscar eventos"
            placeholder="Buscar eventos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-12 border-brand-600/25 bg-white/60 pl-12 text-base md:text-base"
          />
        </div>
      </div>

      {/* Results Count */}
      {pagination.totalEvents > 0 && (
        <div className="mb-6">
          <p role="status" className="text-base text-slate-600">
            {`${pagination.totalEvents} evento${pagination.totalEvents !== 1 ? 's' : ''} encontrado${pagination.totalEvents !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}

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
        <EmptyState
          variant={activeSearch ? 'search' : 'events'}
          title={activeSearch ? 'Nenhum evento encontrado' : 'Nenhum evento disponível'}
          description={
            activeSearch
              ? 'Não encontramos eventos com esses termos de busca. Tente palavras diferentes.'
              : 'Ainda não há eventos agendados. Fique de olho — novidades chegam em breve!'
          }
          action={activeSearch ? { label: 'Limpar busca', onClick: () => setSearchInput('') } : undefined}
        />
      )}
    </div>
  );
}
