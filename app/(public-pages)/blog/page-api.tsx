'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import ArticleList from '@/components/blog/articleList';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { Pagination } from '@/components/common/pagination';
import { type Article, type BlogApiResponse, type BlogPagination } from '@/types/blog';

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<BlogPagination | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const articlesPerPage = 12;

  const fetchArticles = async (page: number = 1, category: string = 'Todos') => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: articlesPerPage.toString(),
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1, selectedCategory);
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page, selectedCategory);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => fetchArticles(currentPage, selectedCategory)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageHeader
        title="Artigos e Insights"
        description="Descubra as últimas tendências, dicas práticas e insights valiosos sobre desenvolvimento, carreira e tecnologia."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            activeCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Articles List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <ArticleList articles={articles} />
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* No articles message */}
        {!isLoading && articles.length === 0 && !error && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum artigo encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não encontramos artigos para a categoria selecionada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
