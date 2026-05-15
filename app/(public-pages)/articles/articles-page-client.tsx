'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ArticleCard from '@/components/blog/articleCard';
import { Pagination } from '@/components/common/pagination';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { type Article, type BlogPagination } from '@/types/blog';

interface ArticlesPageClientProps {
  articles: Article[];
  pagination: BlogPagination;
  categories: string[];
  activeCategory: string;
}

export function ArticlesPageClient({ articles, pagination, categories, activeCategory }: ArticlesPageClientProps) {
  const router = useRouter();

  // Both category change and pagination push to the URL; the server re-renders
  // the page with the new params. No client fetch.
  const buildUrl = (page: number, category: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (category && category !== 'Todos') params.set('category', category);
    const qs = params.toString();
    return qs ? `/articles?${qs}` : '/articles';
  };

  const handleCategoryChange = (category: string) => {
    router.push(buildUrl(1, category));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl(page, activeCategory));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} priority={i < 3} />
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
