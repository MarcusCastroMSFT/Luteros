import { Metadata } from 'next'
import { getArticles } from '@/lib/articles'
import ArticleCard from '@/components/blog/articleCard'
import { CategoryFilter } from '@/components/blog/categoryFilter'
import { Pagination } from '@/components/common/pagination'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/pageHeader'

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
        {/* Rendered directly (not streamed) so the LCP article image is present
            in the initial HTML with its high-priority preload. */}
        <ArticlesContent page={page} category={category} />
      </div>
    </div>
  )
}
