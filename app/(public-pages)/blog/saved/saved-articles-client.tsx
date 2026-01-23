'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
          router.push('/login?redirect=' + encodeURIComponent('/blog/saved'));
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
      router.push('/login?redirect=' + encodeURIComponent('/blog/saved'));
    }
  }, [user, isAuthLoading, router]);

  // Fetch articles when filters change
  useEffect(() => {
    if (user) {
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
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 w-fit">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Bookmark className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          <p className="text-sm text-gray-500">Artigos Salvos</p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="h-auto p-1 bg-muted/50 border border-border rounded-lg w-fit flex-wrap">
            <TabsTrigger 
              value="all"
              className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Todos ({totalCount})
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger 
                key={category}
                value={category}
                className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Você ainda não salvou nenhum artigo
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Explore nossos artigos e salve os que mais interessam para ler depois!
          </p>
          <Button asChild>
            <a href="/blog">Explorar Artigos</a>
          </Button>
        </div>
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
