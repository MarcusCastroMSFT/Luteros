'use client';

import React, { useState, useEffect, useTransition } from 'react';
import ArticleCard from '@/components/blog/articleCard';
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton';
import { Pagination } from '@/components/common/pagination';
import { CategoryFilter } from '@/components/blog/categoryFilter';
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

interface BlogPageClientProps {
  initialArticles: Article[];
  initialPagination: BlogPagination;
  initialCategories: string[];
}

export function BlogPageClient({ initialArticles, initialPagination, initialCategories }: BlogPageClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories] = useState<string[]>(initialCategories);
  const [pagination, setPagination] = useState<BlogPagination>(initialPagination);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (page: number = 1, category: string = 'Todos') => {
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
      } else {
        setError(data.error || 'Erro ao carregar artigos');
      }
    } catch (err) {
      setError('Erro ao carregar artigos');
      console.error('Error fetching articles:', err);
    }
  };

  // Category change
  useEffect(() => {
    if (activeCategory === 'Todos' && currentPage === 1) {
      // Reset to initial data
      setArticles(initialArticles);
      setPagination(initialPagination);
      return;
    }

    startTransition(() => {
      fetchArticles(1, activeCategory);
      setCurrentPage(1);
    });
  }, [activeCategory, initialArticles, initialPagination]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    startTransition(() => {
      fetchArticles(page, activeCategory);
    });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => fetchArticles(currentPage, activeCategory)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Category Filter */}
      <div className="mb-6 md:mb-8">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Results Count */}
      <div className="mb-4 md:mb-6">
        <p className="text-sm md:text-base text-gray-600">
          {pagination.totalArticles === 0 
            ? 'Nenhum artigo encontrado'
            : `${pagination.totalArticles} artigo${pagination.totalArticles !== 1 ? 's' : ''} encontrado${pagination.totalArticles !== 1 ? 's' : ''}`
          }
          {activeCategory !== 'Todos' && ` em "${activeCategory}"`}
        </p>
      </div>

      {/* Articles Grid or Skeleton */}
      {isPending ? (
        <ArticleListSkeleton count={ARTICLES_PER_PAGE} />
      ) : articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            {activeCategory !== 'Todos' 
              ? 'Nenhum artigo encontrado nesta categoria.' 
              : 'Nenhum artigo disponível no momento.'}
          </p>
          {activeCategory !== 'Todos' && (
            <button 
              onClick={() => handleCategoryChange('Todos')}
              className="text-[var(--cta-highlight)] hover:underline"
            >
              Ver todos os artigos
            </button>
          )}
        </div>
      )}
    </>
  );
}
