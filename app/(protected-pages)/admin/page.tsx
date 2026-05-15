import { connection } from 'next/server';
import { DollarSign, Users, UserPlus, UserMinus, Activity, TrendingUp } from 'lucide-react';
import { getAdminOverview } from '@/lib/admin-dashboard';
import { KpiCard } from '@/components/admin/kpi-card';
import { QuickActions } from '@/components/admin/quick-actions';
import { TopArticlesPanel } from '@/components/admin/top-articles-panel';
import { UpcomingEventsPanel } from '@/components/admin/upcoming-events-panel';
import { ModerationAndActivityPanel } from '@/components/admin/moderation-and-activity-panel';

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export default async function AdminDashboardPage() {
  await connection();
  const data = await getAdminOverview();

  // Compute deltas for the "new users" card (this 30d vs prev 30d)
  const newUsersDelta = data.users.newPrev30d > 0
    ? ((data.users.newLast30d - data.users.newPrev30d) / data.users.newPrev30d) * 100
    : data.users.newLast30d > 0 ? 100 : null;

  const subscribersByPlanLabel = data.subscribers.byPlan.length > 0
    ? data.subscribers.byPlan
        .map((p) => `${p.count} ${p.audience === 'doctors' ? 'Médicos' : 'Geral'}`)
        .join(' · ')
    : undefined;

  return (
    <div className="flex flex-1 flex-col bg-gray-50/30 min-h-screen">
      <div className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Visão Geral</h1>
              <p className="mt-1 text-sm text-gray-500">
                Acompanhe o pulso da plataforma: assinaturas, engajamento e o que precisa da sua atenção.
              </p>
            </div>
            <QuickActions />
          </header>

          {/* Hero KPIs */}
          <section
            aria-label="Principais indicadores"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <KpiCard
              label="Receita Recorrente (MRR)"
              value={formatBRL(data.mrr.current)}
              deltaPercent={data.mrr.deltaPercent}
              icon={DollarSign}
              tone="emerald"
              emptyHint={data.mrr.current === 0 ? 'Será calculado quando houver assinaturas ativas' : undefined}
            />
            <KpiCard
              label="Assinantes Ativos"
              value={data.subscribers.total.toLocaleString('pt-BR')}
              sublabel={subscribersByPlanLabel}
              deltaPercent={
                data.subscribers.newPrevMonth > 0
                  ? ((data.subscribers.newThisMonth - data.subscribers.newPrevMonth) / data.subscribers.newPrevMonth) * 100
                  : data.subscribers.newThisMonth > 0
                  ? 100
                  : null
              }
              icon={Users}
              tone="blue"
              emptyHint={data.subscribers.total === 0 ? 'Aguardando primeiros assinantes' : undefined}
            />
            <KpiCard
              label="Novos Usuários (30d)"
              value={data.users.newLast30d.toLocaleString('pt-BR')}
              deltaPercent={newUsersDelta}
              icon={UserPlus}
              tone="violet"
            />
            <KpiCard
              label="Churn (30d)"
              value={
                data.churn.churnRatePercent !== null
                  ? formatPercent(data.churn.churnRatePercent, 1)
                  : '—'
              }
              sublabel={
                data.churn.cancelledLast30d > 0
                  ? `${data.churn.cancelledLast30d} ${data.churn.cancelledLast30d === 1 ? 'cancelamento' : 'cancelamentos'}`
                  : 'Sem cancelamentos'
              }
              deltaInverted
              icon={UserMinus}
              tone="amber"
              emptyHint={
                data.churn.churnRatePercent === null
                  ? 'Disponível após 30 dias de assinaturas'
                  : undefined
              }
            />
          </section>

          {/* Engagement row */}
          <section
            aria-label="Engajamento"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <KpiCard
              label="Usuários ativos (7 dias)"
              value={data.users.activeLast7d.toLocaleString('pt-BR')}
              sublabel={`de ${data.users.total.toLocaleString('pt-BR')} usuários totais`}
              icon={Activity}
              tone="indigo"
            />
            <KpiCard
              label="Conversão para Assinatura"
              value={formatPercent(data.users.conversionRate, 1)}
              sublabel="Assinantes ativos / usuários totais"
              icon={TrendingUp}
              tone="emerald"
            />
          </section>

          {/* Content health strip */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ContentStat label="Artigos publicados" value={data.contentCounts.publishedArticles} />
            <ContentStat label="Rascunhos" value={data.contentCounts.draftArticles} tone="amber" />
            <ContentStat label="Cursos publicados" value={data.contentCounts.publishedCourses} />
            <ContentStat label="Eventos futuros" value={data.contentCounts.upcomingEvents} />
          </section>

          {/* Operational panels */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <TopArticlesPanel articles={data.topArticles} />
              <UpcomingEventsPanel events={data.upcomingEvents} />
            </div>
            <div className="lg:col-span-1">
              <ModerationAndActivityPanel
                moderationPendingCount={data.moderationQueue.pendingCount}
                recentSubscriptions={data.recentSubscriptions}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ContentStat({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: number;
  tone?: 'slate' | 'amber';
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold tabular-nums ${
          tone === 'amber' && value > 0 ? 'text-amber-700' : 'text-gray-900'
        }`}
      >
        {value.toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
