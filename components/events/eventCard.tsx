import React from 'react';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { PaidBadge } from '@/components/common/badges/paid-badge';
import { cn } from '@/lib/utils';
import { type EventCardProps } from '@/types/event';

// Event dates are plain calendar days (YYYY-MM-DD); formatting them in UTC avoids showing the previous day in Brazil.
function parseEventDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function EventCard({ event, className = '' }: EventCardProps) {
  const date = parseEventDate(event.date);
  const format = (options: Intl.DateTimeFormatOptions) => date?.toLocaleDateString('pt-BR', { ...options, timeZone: 'UTC' });
  const fullDate = format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) ?? event.date;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-[12px_36px_12px_12px] border border-brand-600/15 bg-white/60 p-6 transition-colors hover:bg-[#e4eeeb]/50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-brand-600 motion-reduce:transition-none sm:p-8',
        className,
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <time dateTime={event.date.slice(0, 10)} className="flex size-20 shrink-0 flex-col items-center justify-center rounded-[42%_58%_52%_38%] bg-[#e4eeeb] text-brand-900">
          <span className="sr-only">{fullDate}</span>
          <span aria-hidden="true" className="font-[family-name:var(--font-cardo)] text-3xl leading-none">{format({ day: '2-digit' }) ?? '--'}</span>
          <span aria-hidden="true" className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-brand-700">{format({ month: 'short' })?.replace('.', '') ?? ''}</span>
        </time>
        <PaidBadge
          value={event.isFree ? 'Gratuito' : 'Pago'}
          className={cn('px-3 py-1 text-sm', event.isFree ? 'border-brand-600/25 bg-brand-50 text-brand-700' : 'border-[#630a79]/20 bg-[#eadfe9] text-[#630a79]')}
        />
      </div>

      <h3 className="mb-3 font-[family-name:var(--font-cardo)] text-2xl leading-tight text-brand-900">
        <Link href={`/events/${event.slug}`} className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-brand-700 motion-reduce:transition-none">
          {event.title}
        </Link>
      </h3>

      {event.description && (
        <p className="mb-6 line-clamp-3 flex-1 text-base leading-[1.75] text-slate-600">{event.description}</p>
      )}

      <dl className="mt-auto space-y-2 border-t border-brand-600/15 pt-5 text-base text-slate-600">
        <div className="flex items-center gap-3">
          <dt className="sr-only">Horário</dt>
          <Clock aria-hidden="true" className="size-4 shrink-0 text-brand-600" />
          <dd>{event.time}</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt className="sr-only">Local</dt>
          <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
          <dd className="min-w-0 break-words">{event.location}</dd>
        </div>
      </dl>
    </article>
  );
}

// Export the Event type for use in other components
// Export types for backward compatibility
export type { Event, EventCardProps } from '@/types/event';
