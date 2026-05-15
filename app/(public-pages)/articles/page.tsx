import { Suspense } from 'react'
import { Metadata } from 'next'
import { getArticles } from '@/lib/articles'
import { ArticlesPageClient } from './articles-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton'
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton'

const ARTICLES_PER_PAGE = 12

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

interface ArticlesPageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

async function ArticlesContent({ page, category }: { page: number; category: string }) {
  const data = await getArticles(page, ARTICLES_PER_PAGE, category === 'Todos' ? undefined : category)

  return (
    <ArticlesPageClient
      articles={data.articles}
      pagination={data.pagination}
      categories={data.categories}
      activeCategory={category}
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

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const category = sp.category ?? 'Todos'

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
        <Suspense key={`${page}-${category}`} fallback={<ArticlesPageFallback />}>
          <ArticlesContent page={page} category={category} />
        </Suspense>
      </div>
    </div>
  )
}
