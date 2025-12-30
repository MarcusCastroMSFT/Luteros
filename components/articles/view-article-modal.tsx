'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArticleHeader } from '@/components/blog/articleHeader';
import { ArticleContent } from '@/components/blog/articleContent';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  commentCount: number;
  viewCount: number;
  status: 'published' | 'draft';
}

interface ViewArticleModalProps {
  articleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Cache articles in memory to avoid refetching on every open
const articleCache = new Map<string, Article>();

export function ViewArticleModal({
  articleId,
  open,
  onOpenChange,
}: ViewArticleModalProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch article');
      }

      // Cache the article for future opens
      articleCache.set(articleId, data.data);
      setArticle(data.data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err instanceof Error ? err.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && articleId) {
      // Check cache first
      const cached = articleCache.get(articleId);
      if (cached) {
        setArticle(cached);
        setLoading(false);
        return;
      }
      fetchArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, articleId]);

  const handleViewLive = () => {
    if (article) {
      window.open(`/blog/${article.slug}`, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Visualizar Artigo</DialogTitle>
            {article && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewLive}
                className="cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver página ao vivo
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {article && !loading && !error && (
            <>
              {/* Status Badge */}
              {article.status === 'draft' && (
                <Alert className="mb-6">
                  <AlertDescription>
                    Este artigo está em rascunho e não está visível publicamente.
                  </AlertDescription>
                </Alert>
              )}

              {/* Article Preview - Same layout as blog page */}
              <div className="article-preview">
                <ArticleHeader
                  title={article.title}
                  excerpt={article.excerpt}
                  image={article.image}
                  category={article.category}
                  author={article.author.name}
                  date={article.date}
                  readTime={article.readTime}
                  commentCount={article.commentCount}
                />

                <ArticleContent 
                  content={article.content}
                  className="mb-8" 
                />

                {/* Stats Footer */}
                <div className="border-t pt-6 mt-8">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-6">
                      <span>{article.viewCount} visualizações</span>
                      <span>{article.commentCount} comentários</span>
                    </div>
                    <Button
                      variant="default"
                      onClick={handleViewLive}
                      className="cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver página ao vivo
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
