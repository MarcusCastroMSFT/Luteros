import { Suspense } from 'react'
import { Metadata } from 'next'
import { getInitialArticles } from '@/lib/articles'
import { BlogPageClient } from './blog-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton'
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar. Dicas de especialistas e informações confiáveis.',
  keywords: ['blog', 'artigos', 'saúde sexual', 'educação sexual', 'bem-estar', 'saúde íntima'],
  openGraph: {
    title: 'Blog | Luteros',
    description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Luteros',
    description: 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar.',
  },
  alternates: {
    canonical: '/blog',
  },
}

// Server Component for initial data fetching
async function BlogContent() {
  const initialData = await getInitialArticles()
  
  return (
    <BlogPageClient 
      initialArticles={initialData.articles}
      initialPagination={initialData.pagination}
      initialCategories={initialData.categories}
    />
  )
}

// Fallback component while loading
function BlogPageFallback() {
  return (
    <div className="container mx-auto px-4 max-w-[1428px] py-16">
      <div className="flex justify-center mb-12">
        <CategoryFilterSkeleton />
      </div>
      <ArticleListSkeleton count={12} />
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Blog"
        description="Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' }
        ]}
      />
      
      <div className="container mx-auto px-4 max-w-[1428px] py-16">
        <Suspense fallback={<BlogPageFallback />}>
          <BlogContent />
        </Suspense>
      </div>
    </div>
  )
}
