import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getArticles } from '@/lib/articles'
import ArticleCard from '@/components/blog/articleCard'
import { CategoryFilter } from '@/components/blog/categoryFilter'
import { Pagination } from '@/components/common/pagination'
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
  const { articles, pagination, categories } = data
  const categoryParam = category !== 'Todos' ? category : undefined

  return (
    <>
      {/* Category Filter — URL-based, fully server-rendered (no client JS) */}
      <div className="mb-6 md:mb-8">
        <CategoryFilter categories={categories} activeCategory={category} basePath="/articles" />
      </div>

      {/* Results Count */}
      <div className="mb-4 md:mb-6">
        <p className="text-sm md:text-base text-gray-600">
          {pagination.totalArticles === 0
            ? 'Nenhum artigo encontrado'
            : `${pagination.totalArticles} artigo${pagination.totalArticles !== 1 ? 's' : ''} encontrado${pagination.totalArticles !== 1 ? 's' : ''}`}
          {category !== 'Todos' && ` em "${category}"`}
        </p>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} priority={i < 3} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                basePath="/articles"
                queryParams={{ category: categoryParam }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            {category !== 'Todos'
              ? 'Nenhum artigo encontrado nesta categoria.'
              : 'Nenhum artigo disponível no momento.'}
          </p>
          {category !== 'Todos' && (
            <Link href="/articles" className="text-[var(--cta-highlight)] hover:underline">
              Ver todos os artigos
            </Link>
          )}
        </div>
      )}
    </>
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
