'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import ArticleCard from '@/components/blog/articleCard';
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton';
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton';
import { Pagination } from '@/components/common/pagination';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { Button } from '@/components/ui/button';
import { type Article, type BlogPagination } from '@/types/blog';

const ARTICLES_PER_PAGE = 12;

interface BlogApiResponse {
  success: boolean;
  data?: {
    articles: Article[];
    pagination: BlogPagination;
    categories: string[];
  };
  error?: string;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<BlogPagination | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchArticles = async (page: number = 1, category: string = 'Todos', isInitial: boolean = false) => {
    // Only show full loading on initial load
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingArticles(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ARTICLES_PER_PAGE.toString(),
      });

      if (category !== 'Todos') {
        params.append('category', category);
      }

      const response = await fetch(`/api/blog?${params}`);
      const data: BlogApiResponse = await response.json();

      if (data.success && data.data) {
        setArticles(data.data.articles);
        setPagination(data.data.pagination);
        // Only set categories on initial load
        if (isInitial || categories.length === 0) {
          setCategories(data.data.categories);
        }
      } else {
        setError(data.error || 'Erro ao carregar artigos');
      }
    } catch (err) {
      setError('Erro ao carregar artigos');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
      setLoadingArticles(false);
      setInitialLoad(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchArticles(1, 'Todos', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category change - only fetch articles, not categories
  useEffect(() => {
    if (!initialLoad) {
      fetchArticles(1, activeCategory, false);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page, activeCategory, false);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog' }
  ];

  if (error) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title="Blog"
          description="Artigos e conteúdos gratuitos sobre educação sexual e saúde íntima para seu bem-estar."
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-4 max-w-[1428px] py-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchArticles(currentPage, activeCategory, true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
        {/* Filters Section - Centered */}
        <div className="flex justify-center mb-12">
          {loading && categories.length === 0 ? (
            <CategoryFilterSkeleton />
          ) : (
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}
        </div>

        {/* Articles Grid */}
        {loading || loadingArticles ? (
          <ArticleListSkeleton count={ARTICLES_PER_PAGE} />
        ) : (
          <>
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {activeCategory !== 'Todos' 
                    ? `Não encontramos artigos na categoria "${activeCategory}".`
                    : 'Não há artigos disponíveis no momento.'
                  }
                </p>
                {activeCategory !== 'Todos' && (
                  <Button onClick={() => handleCategoryChange('Todos')} className="cursor-pointer">
                    Ver todos os artigos
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
