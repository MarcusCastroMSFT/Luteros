import React from 'react';
import ArticleCard from './articleCard';
import { Article } from '@/types/blog';

interface RelatedArticlesProps {
  articles: Article[];
  currentArticleId: string;
  limit?: number;
  className?: string;
}

export function RelatedArticles({ 
  articles, 
  currentArticleId, 
  limit = 3,
  className = ''
}: RelatedArticlesProps) {
  // Filter out current article and limit results
  const relatedArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, limit);

  if (relatedArticles.length === 0) return null;

  return (
    <section className={`${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 font-cardo">
        Artigos Relacionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
