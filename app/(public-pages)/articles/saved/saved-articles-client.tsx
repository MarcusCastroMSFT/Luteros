'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterTabs, UserCardSkeleton, UserStat, loadMoreButtonClass } from '@/components/common/user-area';
import { EmptyState } from '@/components/common/empty-state';
import { SavedArticleCard } from '@/components/blog/saved-article-card';
import { type SavedArticle } from '@/app/api/users/saved-articles/route';
import { useAuth } from '@/contexts/auth-context';

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  articlesPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function SavedArticlesClient() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);

  const fetchArticles = useCallback(async (category: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
      });
      if (category !== 'all') {
        params.set('category', category);
      }

      const response = await fetch(`/api/users/saved-articles?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirect=' + encodeURIComponent('/articles/saved'));
          return;
        }
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      if (data.success) {
        setArticles(data.data.savedArticles);
        setPagination(data.data.pagination);
        setCategories(data.data.categories);
        setTotalCount(data.data.stats.total);
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent('/articles/saved'));
    }
  }, [user, isAuthLoading, router]);

  // Fetch articles when filters change
  useEffect(() => {
    if (user) {
      // fetch when filters change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchArticles(selectedCategory, page);
    }
  }, [user, selectedCategory, page, fetchArticles]);

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleRemoveBookmark = (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.articleId !== articleId));
    setTotalCount((prev) => prev - 1);
  };

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Stats Card */}
      <div className="w-fit">
        <UserStat icon={<Bookmark className="size-6" />} value={totalCount} label="Artigos salvos" />
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <FilterTabs<string>
          label="Filtrar por categoria"
          value={selectedCategory}
          onChange={handleCategoryChange}
          options={[
            { value: 'all', label: `Todos (${totalCount})` },
            ...categories.map((category) => ({ value: category, label: category })),
          ]}
        />
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <UserCardSkeleton key={i} imageHeight="h-48" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          variant="articles"
          title="Você ainda não salvou nenhum artigo"
          description="Explore nossos artigos e salve os que mais interessam para ler depois!"
          action={{ label: 'Explorar Artigos', href: '/articles' }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((savedArticle) => (
              <SavedArticleCard 
                key={savedArticle.id} 
                savedArticle={savedArticle} 
                onRemove={handleRemoveBookmark}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoading}
                className={loadMoreButtonClass}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais artigos'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
