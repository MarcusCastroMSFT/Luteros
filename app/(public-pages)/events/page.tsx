import { Suspense } from 'react'
import { Metadata } from 'next'
import { getInitialEvents } from '@/lib/events'
import { EventsPageClient } from './events-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { EventListSkeleton } from '@/components/events/eventSkeleton'

export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Participe de nossos eventos e workshops sobre saúde sexual e bem-estar. Encontre palestras, cursos presenciais e online.',
  keywords: ['eventos', 'workshops', 'palestras', 'saúde sexual', 'bem-estar', 'cursos'],
  openGraph: {
    title: 'Eventos | Luteros',
    description: 'Participe de nossos eventos e workshops sobre saúde sexual e bem-estar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos | Luteros',
    description: 'Participe de nossos eventos e workshops sobre saúde sexual e bem-estar.',
  },
  alternates: {
    canonical: '/events',
  },
}

// Server Component for initial data fetching
async function EventsContent() {
  const initialData = await getInitialEvents()
  
  return (
    <EventsPageClient 
      initialEvents={initialData.events}
      initialPagination={initialData.pagination}
    />
  )
}

// Fallback component while loading
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

export default function EventsPage() {
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
      
      <Suspense fallback={<EventsPageFallback />}>
        <EventsContent />
      </Suspense>
    </div>
  )
}
