import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpcomingEvent {
  id: string;
  slug: string;
  title: string;
  eventDate: Date;
  location: string;
  totalSlots: number;
  bookedSlots: number;
  isFree: boolean;
}

interface Props {
  events: UpcomingEvent[];
}

function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function UpcomingEventsPanel({ events }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Próximos eventos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ocupação de vagas</p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="p-8 text-center">
          <CalendarPlus className="mx-auto h-10 w-10 text-gray-300 mb-2" aria-hidden />
          <p className="text-sm text-gray-500">Nenhum evento agendado</p>
          <Link
            href="/admin/events"
            className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
          >
            Criar evento
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {events.map((event) => {
            const fillPercent = event.totalSlots > 0
              ? Math.min(100, Math.round((event.bookedSlots / event.totalSlots) * 100))
              : 0;
            const fillTone =
              fillPercent >= 80 ? 'bg-rose-500' : fillPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <li key={event.id} className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      {formatEventDate(new Date(event.eventDate))}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-gray-900 hover:text-primary truncate"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" aria-hidden /> {event.location}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900 tabular-nums">
                      {event.bookedSlots}/{event.totalSlots}
                    </p>
                    <p className="text-[10px] text-gray-500">vagas</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn('h-full rounded-full transition-all', fillTone)}
                    style={{ width: `${fillPercent}%` }}
                    aria-label={`${fillPercent}% das vagas ocupadas`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
