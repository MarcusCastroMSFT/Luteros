import { Lock, Stethoscope, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type ArticleAccessType = 'free' | 'paid' | string | undefined;
type ArticleAudience = 'general' | 'doctors' | string | undefined;

interface ArticleAccessBadgeProps {
  accessType: ArticleAccessType;
  /** Show even when the article is free (renders a "Gratuito" badge). Default: false (hides for free). */
  showFree?: boolean;
  className?: string;
}

/**
 * Badge indicating an article's access type (Pago / Gratuito).
 * By default only renders for paid articles — free is implied.
 */
export function ArticleAccessBadge({ accessType, showFree = false, className }: ArticleAccessBadgeProps) {
  const isPaid = accessType === 'paid';
  if (!isPaid && !showFree) return null;

  if (isPaid) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-xs font-medium text-white shadow-sm',
          className,
        )}
      >
        <Lock className="w-3 h-3" aria-hidden />
        Pago
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800',
        className,
      )}
    >
      Gratuito
    </span>
  );
}

interface ArticleAudienceBadgeProps {
  audience: ArticleAudience;
  /** Show even when the article is for the general public. Default: false (hides for general). */
  showGeneral?: boolean;
  className?: string;
}

/**
 * Badge indicating an article's target audience (Médicos / Público Geral).
 * By default only renders for doctors-only articles — general is implied.
 */
export function ArticleAudienceBadge({ audience, showGeneral = false, className }: ArticleAudienceBadgeProps) {
  const isDoctors = audience === 'doctors';
  if (!isDoctors && !showGeneral) return null;

  if (isDoctors) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-blue-600/95 px-2.5 py-1 text-xs font-medium text-white shadow-sm',
          className,
        )}
      >
        <Stethoscope className="w-3 h-3" aria-hidden />
        Médicos
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700',
        className,
      )}
    >
      <Users className="w-3 h-3" aria-hidden />
      Público Geral
    </span>
  );
}
