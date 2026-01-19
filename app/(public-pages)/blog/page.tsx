import React, { Suspense } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import ArticleCard from '@/components/blog/articleCard';
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton';
import { Pagination } from '@/components/common/pagination';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { type Article, type BlogApiResponse } from '@/types/blog';

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

const ARTICLES_PER_PAGE = 12;

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

// Server-side data fetching with ISR
async function getArticles(page: number, category: string): Promise<BlogApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: ARTICLES_PER_PAGE.toString(),
  });

  if (category && category !== 'Todos') {
    params.append('category', category);
  }

  try {
    const response = await fetch(`${baseUrl}/api/blog?${params}`, {
      next: { revalidate: 1800, tags: ['articles'] },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      success: false,
      error: 'Erro ao carregar artigos',
      data: null,
    };
  }
}

// Articles Grid Component
function ArticlesGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Nenhum artigo encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Não encontramos artigos para a categoria selecionada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1'));
  const category = params.category || 'Todos';
  
  const result = await getArticles(page, category);
  
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog' }
  ];

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title="Blog"
          description="Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar."
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {result.error || 'Erro ao carregar artigos'}
          </p>
        </div>
      </div>
    );
  }

  const { articles, pagination, categories } = result.data;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Blog"
        description="Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar."
        breadcrumbs={breadcrumbs}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-[1428px] py-16">
        {/* Category Filter - URL-based navigation for Server Component */}
        <Suspense fallback={<div className="h-12 mb-8" />}>
          <CategoryFilter
            categories={categories}
            activeCategory={category}
          />
        </Suspense>

        {/* Articles Grid */}
        <Suspense fallback={<ArticleListSkeleton count={ARTICLES_PER_PAGE} />}>
          <ArticlesGrid articles={articles} />
        </Suspense>

        {/* Pagination - URL-based navigation for Server Component */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            basePath="/blog"
            queryParams={{ category: category !== 'Todos' ? category : undefined }}
          />
        )}
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const category = params.category;
  const page = params.page ? parseInt(params.page) : 1;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luteros.com';
  
  const title = category && category !== 'Todos' 
    ? `${category} - Blog`
    : 'Blog';
  
  const description = category && category !== 'Todos'
    ? `Artigos sobre ${category}. Conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar.`
    : 'Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar.';

  // Build canonical URL
  const canonicalParams = new URLSearchParams();
  if (category && category !== 'Todos') canonicalParams.set('category', category);
  if (page > 1) canonicalParams.set('page', page.toString());
  const canonicalUrl = canonicalParams.toString() 
    ? `${baseUrl}/blog?${canonicalParams}` 
    : `${baseUrl}/blog`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Luteros`,
      description,
      url: canonicalUrl,
      siteName: 'Luteros',
      type: 'website',
      locale: 'pt_BR',
      images: [
        {
          url: `${baseUrl}/images/og-blog.jpg`,
          width: 1200,
          height: 630,
          alt: 'Luteros Blog',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Luteros`,
      description,
    },
    robots: {
      index: page === 1, // Only index first page to avoid duplicate content
      follow: true,
    },
  };
}
