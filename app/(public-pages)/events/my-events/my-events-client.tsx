'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Eventos Inscritos</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
            <p className="text-sm text-gray-500">Próximos</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.past}</p>
            <p className="text-sm text-gray-500">Participados</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={status} onValueChange={handleStatusChange} className="w-full">
        <TabsList className="h-auto p-1 bg-muted/50 border border-border rounded-lg w-fit">
          <TabsTrigger 
            value="all"
            className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Todos ({stats.total})
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming"
            className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4 mr-2 text-amber-500" />
            Próximos ({stats.upcoming})
          </TabsTrigger>
          <TabsTrigger 
            value="past"
            className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            Participados ({stats.past})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'all' 
              ? 'Você ainda não está inscrito em nenhum evento' 
              : status === 'upcoming'
              ? 'Nenhum evento próximo'
              : 'Nenhum evento participado ainda'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {status === 'all'
              ? 'Explore nossos eventos e participe de experiências incríveis!'
              : status === 'upcoming'
              ? 'Inscreva-se em eventos para vê-los aqui.'
              : 'Participe de eventos para vê-los aqui.'}
          </p>
          {status === 'all' && (
            <Button asChild>
              <a href="/events">Explorar Eventos</a>
            </Button>
          )}
        </div>
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
