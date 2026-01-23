import { Suspense } from 'react'
import { Metadata } from 'next'
import { getInitialCommunityPosts, getCategoryStats } from '@/lib/community'
import { CommunityPageClient } from './community-page-client'
import { CommunitySkeleton } from '@/components/community/communitySkeleton'
import { PageHeader } from '@/components/common/pageHeader'

export const metadata: Metadata = {
  title: 'Comunidade',
  description: 'Conecte-se com outras pessoas que compartilham experiências semelhantes. Participe de discussões sobre gravidez, pós-parto, fertilidade e muito mais.',
  keywords: ['comunidade', 'fórum', 'gravidez', 'maternidade', 'pós-parto', 'fertilidade', 'apoio'],
  openGraph: {
    title: 'Comunidade | lutteros',
    description: 'Conecte-se com outras pessoas que compartilham experiências semelhantes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comunidade | lutteros',
    description: 'Conecte-se com outras pessoas que compartilham experiências semelhantes.',
  },
  alternates: {
    canonical: '/community',
  },
}

// Server Component for initial data fetching with caching
async function CommunityContent() {
  // Fetch initial posts with 'Gravidez' category (default)
  const [initialData, categoryStats] = await Promise.all([
    getInitialCommunityPosts('Gravidez'),
    getCategoryStats(),
  ])
  
  return (
    <CommunityPageClient 
      initialPosts={initialData.posts}
      initialPagination={initialData.pagination}
      initialCategories={categoryStats.map((c: { category: string }) => c.category)}
    />
  )
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Comunidade"
        description="Conecte-se com outras pessoas que compartilham experiências semelhantes."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Comunidade' }
        ]}
      />
      
      <Suspense fallback={<CommunitySkeleton />}>
        <CommunityContent />
      </Suspense>
    </div>
  )
}

