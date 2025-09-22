'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import ArticleCard from '@/components/blog/articleCard';
import { ArticleListSkeleton } from '@/components/blog/articleSkeleton';
import { Pagination } from '@/components/common/pagination';
import { sampleArticles } from '@/data/articles';

const ARTICLES_PER_PAGE = 12;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get unique categories from articles
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(sampleArticles.map(article => article.category)));
    return ['Todos', ...uniqueCategories];
  }, []);

  // Filter articles by category
  const filteredArticles = useMemo(() => {
    if (activeCategory === 'Todos') {
      return sampleArticles;
    }
    return sampleArticles.filter(article => article.category === activeCategory);
  }, [activeCategory]);

  // Paginate articles
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, currentPage]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setLoading(true);
    setActiveCategory(category);
    setCurrentPage(1);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handlePageChange = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog' }
  ];

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
              {paginatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
