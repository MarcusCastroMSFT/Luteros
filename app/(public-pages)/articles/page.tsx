import { Suspense } from 'react'
import { Metadata } from 'next'
import { getInitialArticles } from '@/lib/articles'
import { ArticlesPageClient } from './articles-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton'
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton'

export const metadata: Metadata = {
  title: 'Artigos',
  description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar. Dicas de especialistas e informações confiáveis.',
  keywords: ['artigos', 'saúde sexual', 'educação sexual', 'bem-estar', 'saúde íntima'],
  openGraph: {
    title: 'Artigos | lutteros',
    description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artigos | lutteros',
    description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar.',
  },
  alternates: {
    canonical: '/articles',
  },
}

async function ArticlesContent() {
  const initialData = await getInitialArticles()

  return (
    <ArticlesPageClient
      initialArticles={initialData.articles}
      initialPagination={initialData.pagination}
      initialCategories={initialData.categories}
    />
  )
}

function ArticlesPageFallback() {
  return (
    <div className="container mx-auto px-4 max-w-[1428px] py-16">
      <div className="flex justify-center mb-12">
        <CategoryFilterSkeleton />
      </div>
      <ArticleListSkeleton count={12} />
    </div>
  )
}

export default function ArticlesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Artigos"
        description="Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Artigos' }
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1428px] py-8 md:py-16">
        <Suspense fallback={<ArticlesPageFallback />}>
          <ArticlesContent />
        </Suspense>
      </div>
    </div>
  )
}
