'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import ArticleCard from '@/components/blog/articleCard';
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton';
import { Pagination } from '@/components/common/pagination';
import { type Article, type BlogApiResponse, type BlogPagination } from '@/types/blog';

const ARTICLES_PER_PAGE = 12;

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<BlogPagination | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (page: number = 1, category: string = 'Todos') => {
    setLoading(true);
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
        setCategories(data.data.categories);
      } else {
        setError(data.error || 'Erro ao carregar artigos');
      }
    } catch (err) {
      setError('Erro ao carregar artigos');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1, activeCategory);
    setCurrentPage(1);
  }, [activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page, activeCategory);
    
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
        
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchArticles(currentPage, activeCategory)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Articles Grid */}
        {loading ? (
          <ArticleListSkeleton count={ARTICLES_PER_PAGE} />
        ) : (
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
                onPageChange={handlePageChange}
              />
            )}

            {/* No articles message */}
            {articles.length === 0 && !error && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Não encontramos artigos para a categoria selecionada.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
