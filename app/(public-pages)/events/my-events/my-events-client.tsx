'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterTabs, UserCardSkeleton, UserStat, loadMoreButtonClass } from '@/components/common/user-area';
import { EmptyState } from '@/components/common/empty-state';
import { RegisteredEventCard } from '@/components/events/registered-event-card';
import { type RegisteredEvent } from '@/app/api/users/registered-events/route';
import { useAuth } from '@/contexts/auth-context';

interface MyEventsStats {
  total: number;
  upcoming: number;
  past: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  eventsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type StatusFilter = 'all' | 'upcoming' | 'past';

export function MyEventsClient() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [events, setEvents] = useState<RegisteredEvent[]>([]);
  const [stats, setStats] = useState<MyEventsStats>({ total: 0, upcoming: 0, past: 0 });
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async (statusFilter: StatusFilter, pageNum: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
      });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/users/registered-events?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirect=' + encodeURIComponent('/events/my-events'));
          return;
        }
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      if (data.success) {
        setEvents(data.data.registeredEvents);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching registered events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent('/events/my-events'));
    }
  }, [user, isAuthLoading, router]);

  // Fetch events when filters change
  useEffect(() => {
    if (user) {
      // fetch when filters change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchEvents(status, page);
    }
  }, [user, status, page, fetchEvents]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as StatusFilter);
    setPage(1); // Reset to first page when changing filter
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <UserStat icon={<Calendar className="size-6" />} value={stats.total} label="Eventos inscritos" />
        <UserStat icon={<Clock className="size-6" />} value={stats.upcoming} label="Próximos" />
        <UserStat icon={<CheckCircle2 className="size-6" />} value={stats.past} label="Participados" />
      </div>

      {/* Filter Tabs */}
      <FilterTabs<StatusFilter>
        label="Filtrar eventos"
        value={status}
        onChange={handleStatusChange}
        options={[
          { value: 'all', label: `Todos (${stats.total})` },
          { value: 'upcoming', label: `Próximos (${stats.upcoming})` },
          { value: 'past', label: `Participados (${stats.past})` },
        ]}
      />

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          variant="events"
          title={
            status === 'all'
              ? 'Você ainda não está inscrito em nenhum evento'
              : status === 'upcoming'
              ? 'Nenhum evento próximo'
              : 'Nenhum evento participado ainda'
          }
          description={
            status === 'all'
              ? 'Explore nossos eventos e participe de experiências incríveis!'
              : status === 'upcoming'
              ? 'Inscreva-se em eventos para vê-los aqui.'
              : 'Participe de eventos para vê-los aqui.'
          }
          action={status === 'all' ? { label: 'Explorar Eventos', href: '/events' } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((registration) => (
              <RegisteredEventCard key={registration.id} registration={registration} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoading}
                className={loadMoreButtonClass}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais eventos'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
