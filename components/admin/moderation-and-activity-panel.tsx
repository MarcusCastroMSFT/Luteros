import Link from 'next/link';
import { ShieldAlert, Sparkles, Stethoscope, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentSubscription {
  id: string;
  userName: string | null;
  userEmail: string | null;
  planName: string;
  audience: 'general' | 'doctors';
  startsAt: Date;
}

interface Props {
  moderationPendingCount: number;
  recentSubscriptions: RecentSubscription[];
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d atrás`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

export function ModerationAndActivityPanel({ moderationPendingCount, recentSubscriptions }: Props) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {/* Moderation queue callout */}
      <div
        className={cn(
          'flex items-center gap-4 rounded-xl border p-5 shadow-sm',
          moderationPendingCount > 0
            ? 'border-rose-200 bg-rose-50/40'
            : 'border-gray-200 bg-white',
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
            moderationPendingCount > 0 ? 'bg-rose-100' : 'bg-emerald-50',
          )}
        >
          <ShieldAlert
            className={cn('h-6 w-6', moderationPendingCount > 0 ? 'text-rose-600' : 'text-emerald-600')}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-900">Moderação da comunidade</h2>
          {moderationPendingCount > 0 ? (
            <p className="text-xs text-gray-600 mt-0.5">
              <span className="font-semibold text-rose-700">{moderationPendingCount}</span>{' '}
              {moderationPendingCount === 1 ? 'denúncia pendente' : 'denúncias pendentes'} aguardando revisão
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">Nenhuma denúncia pendente. 🎉</p>
          )}
        </div>
        {moderationPendingCount > 0 && (
          <Link
            href="/admin/community"
            className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors"
          >
            Revisar
          </Link>
        )}
      </div>

      {/* Latest subscriptions */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" aria-hidden />
            <h2 className="text-base font-semibold text-gray-900">Novas assinaturas</h2>
          </div>
        </header>
        {recentSubscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">
              Quando alguém assinar, as ativações recentes aparecem aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentSubscriptions.map((sub) => {
              const isDoctors = sub.audience === 'doctors';
              const Icon = isDoctors ? Stethoscope : Users;
              return (
                <li key={sub.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      isDoctors ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sub.userName || sub.userEmail || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{sub.planName}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{relativeTime(sub.startsAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
