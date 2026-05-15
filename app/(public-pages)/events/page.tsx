import { Suspense } from 'react'
import { Metadata } from 'next'
import { getEvents } from '@/lib/events'
import { EventsPageClient } from './events-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { EventListSkeleton } from '@/components/events/eventSkeleton'

const EVENTS_PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Participe de nossos eventos e workshops sobre saúde sexual e bem-estar. Encontre palestras, cursos presenciais e online.',
  keywords: ['eventos', 'workshops', 'palestras', 'saúde sexual', 'bem-estar', 'cursos'],
  openGraph: {
    title: 'Eventos | lutteros',
    description: 'Participe de nossos eventos e workshops sobre saúde sexual e bem-estar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos | lutteros',
    description: 'Participe de nossos eventos e workshops sobre saúde sexual e bem-estar.',
  },
  alternates: {
    canonical: '/events',
  },
}

interface EventsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

async function EventsContent({ page, search }: { page: number; search: string }) {
  const data = await getEvents(page, EVENTS_PER_PAGE, search || undefined)

  return (
    <EventsPageClient
      events={data.events}
      pagination={data.pagination}
      activeSearch={search}
    />
  )
}

function EventsPageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded-md w-full max-w-md animate-pulse" />
      </div>
      <div className="mb-6">
        <div className="h-5 bg-gray-200 rounded w-40 animate-pulse" />
      </div>
      <EventListSkeleton count={9} />
    </div>
  )
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const search = sp.search ?? ''

  return (
    <div className="bg-gray-50 pb-16">
      <PageHeader
        title="Eventos"
        description="Participe de nossos eventos e workshops sobre saúde sexual e bem-estar."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Eventos' }
        ]}
      />

      <Suspense key={`${page}-${search}`} fallback={<EventsPageFallback />}>
        <EventsContent page={page} search={search} />
      </Suspense>
    </div>
  )
}
