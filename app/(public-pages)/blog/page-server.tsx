import React from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import ArticleCard from '@/components/blog/articleCard';
import { Pagination } from '@/components/common/pagination';
import { type Article, type BlogApiResponse } from '@/types/blog';
import { sampleArticles } from '@/data/articles';

const ARTICLES_PER_PAGE = 12;

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

// Fetch articles with ISR support
async function getArticlesData(page: number = 1, category: string = 'Todos') {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: ARTICLES_PER_PAGE.toString(),
    });

    if (category !== 'Todos') {
      params.append('category', category);
    }

    const response = await fetch(`${baseUrl}/api/blog?${params}`, {
      // ISR: Revalidate every 30 minutes for the blog listing
      next: { 
        revalidate: 1800, // 30 minutes
        tags: ['articles', 'blog-listing'] // Tags for on-demand revalidation
      }
    });

    if (response.ok) {
      const data: BlogApiResponse = await response.json();
      if (data.success && data.data) {
        return {
          articles: data.data.articles,
          pagination: data.data.pagination,
          categories: data.data.categories,
        };
      }
    }

    console.warn('API fetch failed for articles, using fallback');
    
    // Fallback to static data
    let filteredArticles = [...sampleArticles];
    
    if (category && category !== 'Todos') {
      filteredArticles = filteredArticles.filter(article => 
        article.category === category
      );
    }

    // Sort by date (newest first)
    filteredArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const totalArticles = filteredArticles.length;
    const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
    const startIndex = (page - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    // Get unique categories
    const categories = ['Todos', ...Array.from(new Set(sampleArticles.map(article => article.category)))];

    return {
      articles: paginatedArticles,
      pagination: {
        currentPage: page,
        totalPages,
        totalArticles,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      categories,
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    
    // Emergency fallback
    const categories = ['Todos', ...Array.from(new Set(sampleArticles.map(article => article.category)))];
    return {
      articles: sampleArticles.slice(0, ARTICLES_PER_PAGE),
      pagination: {
        currentPage: 1,
        totalPages: Math.ceil(sampleArticles.length / ARTICLES_PER_PAGE),
        totalArticles: sampleArticles.length,
        hasNextPage: sampleArticles.length > ARTICLES_PER_PAGE,
        hasPreviousPage: false,
      },
      categories,
    };
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page, category } = await searchParams;
  const currentPage = parseInt(page || '1');
  const activeCategory = category || 'Todos';

  const { articles, pagination, categories } = await getArticlesData(currentPage, activeCategory);

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Blog"
        description="Explore os nossos artigos sobre educação sexual, saúde reprodutiva e relacionamentos saudáveis. Informação confiável e atualizada para todas as idades."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' },
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-[1428px] py-16">
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={(newCategory) => {
            // This will be handled by URL navigation in the client component
          }}
        />

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(newPage) => {
                  // This will be handled by URL navigation
                }}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum artigo encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não há artigos disponíveis para a categoria selecionada.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Blog | Luteros - Educação Sexual e Saúde Reprodutiva',
    description: 'Explore os nossos artigos sobre educação sexual, saúde reprodutiva e relacionamentos saudáveis. Informação confiável e atualizada para todas as idades.',
    openGraph: {
      title: 'Blog | Luteros',
      description: 'Explore os nossos artigos sobre educação sexual, saúde reprodutiva e relacionamentos saudáveis.',
      type: 'website',
      images: ['/images/blog-hero.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog | Luteros',
      description: 'Explore os nossos artigos sobre educação sexual, saúde reprodutiva e relacionamentos saudáveis.',
      images: ['/images/blog-hero.jpg'],
    },
  };
}
