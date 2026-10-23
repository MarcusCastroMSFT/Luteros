import { Metadata } from 'next'
import { Suspense } from 'react'
import { getArticles } from '@/lib/articles'
import { CategoryFilter } from '@/components/blog/categoryFilter'
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton'
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton'
import { CatalogList } from '@/components/common/catalog-list'
import { CATALOG_PAGE_SIZE } from '@/lib/catalog-pagination'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/pageHeader'

export const metadata: Metadata = {
  title: 'Artigos',
  description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar. Dicas de especialistas e informações confiáveis.',
  keywords: ['artigos', 'saúde sexual', 'educação sexual', 'bem-estar', 'saúde íntima'],
  openGraph: {
    images: [DEFAULT_SOCIAL_IMAGE],
    title: 'Artigos | lutteros',
    description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar.',
    type: 'website',
  },
  twitter: {
    images: [DEFAULT_SOCIAL_IMAGE.url],
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

async function ArticlesContent({ searchParams }: ArticlesPageProps) {
  // Read the request params here, inside <Suspense>, so the page shell stays static.
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const category = sp.category ?? 'Todos'
  const data = await getArticles(page, CATALOG_PAGE_SIZE, category === 'Todos' ? undefined : category)
  const { articles, pagination, categories } = data

  return (
    <>
      {/* Category Filter — URL-based, fully server-rendered (no client JS) */}
      <h2 className="sr-only">Lista de artigos</h2>
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
        <CatalogList
          key={`${category}-${page}`}
          initialPage={{ kind: 'articles', items: articles, pagination }}
          category={category}
        />
      ) : (
        <EmptyState
          variant={category !== 'Todos' ? 'search' : 'articles'}
          title={category !== 'Todos' ? 'Nenhum artigo encontrado' : 'Nenhum artigo disponível'}
          description={
            category !== 'Todos'
              ? `Não encontramos artigos na categoria “${category}”. Explore outras categorias ou veja todos os conteúdos.`
              : 'Novos conteúdos sobre saúde sexual e bem-estar chegam em breve. Volte logo!'
          }
          action={category !== 'Todos' ? { label: 'Ver todos os artigos', href: '/articles' } : undefined}
        />
      )}
    </>
  )
}

function ArticlesPageFallback() {
  return (
    <>
      <div className="mb-6 md:mb-8">
        <CategoryFilterSkeleton />
      </div>
      <ArticleListSkeleton count={CATALOG_PAGE_SIZE} />
    </>
  )
}

export default function ArticlesPage({ searchParams }: ArticlesPageProps) {
  return (
    <div className="min-h-screen">
      <PageHeader
        illustration="articles"
        title="Artigos"
        description="Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Artigos' }
        ]}
      />

      <div className="mx-auto max-w-[1480px] px-6 pb-20 pt-6 sm:px-10 lg:px-12">
        <Suspense fallback={<ArticlesPageFallback />}>
          <ArticlesContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
