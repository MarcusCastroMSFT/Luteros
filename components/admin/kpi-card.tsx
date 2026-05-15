import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'emerald' | 'blue' | 'violet' | 'amber' | 'indigo' | 'slate';

interface KpiCardProps {
  label: string;
  value: string;
  /** Optional secondary value/line (e.g. "12 Geral · 3 Médicos") */
  sublabel?: string;
  /** Delta in percent. Positive = up. null = no previous data. */
  deltaPercent?: number | null;
  /** When set, a negative delta is treated as "good" (e.g. churn). Default false. */
  deltaInverted?: boolean;
  icon?: LucideIcon;
  tone?: Tone;
  /** Short hint shown under the value when there's no data yet */
  emptyHint?: string;
}

const toneStyles: Record<Tone, { ring: string; iconBg: string; iconColor: string }> = {
  emerald: { ring: 'from-emerald-400/60', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  blue: { ring: 'from-blue-400/60', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  violet: { ring: 'from-violet-400/60', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  amber: { ring: 'from-amber-400/60', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  indigo: { ring: 'from-indigo-400/60', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  slate: { ring: 'from-slate-400/60', iconBg: 'bg-slate-50', iconColor: 'text-slate-600' },
};

function formatDelta(deltaPercent: number) {
  const abs = Math.abs(deltaPercent);
  if (abs >= 1000) return `${deltaPercent > 0 ? '+' : ''}${Math.round(deltaPercent / 100) * 100}%`;
  if (abs >= 10) return `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(0)}%`;
  return `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%`;
}

export function KpiCard({
  label,
  value,
  sublabel,
  deltaPercent,
  deltaInverted = false,
  icon: Icon,
  tone = 'slate',
  emptyHint,
}: KpiCardProps) {
  const styles = toneStyles[tone];
  const showDelta = deltaPercent !== undefined && deltaPercent !== null && Number.isFinite(deltaPercent);
  const isPositiveSignal = showDelta && (deltaInverted ? deltaPercent! < 0 : deltaPercent! > 0);
  const isNegativeSignal = showDelta && (deltaInverted ? deltaPercent! > 0 : deltaPercent! < 0);
  const isFlat = showDelta && deltaPercent === 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Top accent gradient */}
      <div
        aria-hidden
        className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent', styles.ring)}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 tabular-nums">{value}</p>
          {sublabel && (
            <p className="mt-1 text-xs text-gray-500 truncate">{sublabel}</p>
          )}
          {!sublabel && emptyHint && !showDelta && (
            <p className="mt-1 text-xs text-gray-400">{emptyHint}</p>
          )}
        </div>

        {Icon && (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', styles.iconBg)}>
            <Icon className={cn('h-5 w-5', styles.iconColor)} aria-hidden />
          </div>
        )}
      </div>

      {showDelta && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositiveSignal && 'bg-emerald-50 text-emerald-700',
              isNegativeSignal && 'bg-rose-50 text-rose-700',
              isFlat && 'bg-gray-100 text-gray-600',
            )}
          >
            {isPositiveSignal && <TrendingUp className="h-3 w-3" aria-hidden />}
            {isNegativeSignal && <TrendingDown className="h-3 w-3" aria-hidden />}
            {isFlat && <Minus className="h-3 w-3" aria-hidden />}
            {formatDelta(deltaPercent!)}
          </span>
          <span className="text-xs text-gray-500">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
