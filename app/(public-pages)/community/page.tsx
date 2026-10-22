import { Suspense } from 'react'
import { Metadata } from 'next'
import { getInitialCommunityPosts, getCategoryStats } from '@/lib/community'
import { CommunityPageClient } from './community-page-client'
import { CommunitySkeleton } from '@/components/community/communitySkeleton'
import { PageHeader } from '@/components/common/pageHeader'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images'

const communityDescription = 'Espaço de discussão da Lutteros para trocar experiências e refletir sobre saúde sexual.'

export const metadata: Metadata = {
  title: 'Comunidade',
  description: communityDescription,
  keywords: ['comunidade', 'fórum', 'saúde sexual', 'discussões', 'apoio'],
  openGraph: {
    images: [DEFAULT_SOCIAL_IMAGE],
    title: 'Comunidade | lutteros',
    description: communityDescription,
    type: 'website',
  },
  twitter: {
    images: [DEFAULT_SOCIAL_IMAGE.url],
    card: 'summary_large_image',
    title: 'Comunidade | lutteros',
    description: communityDescription,
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
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="discussion"
        title="Comunidade"
        description="Troque experiências e reflita sobre saúde sexual com outras pessoas."
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

