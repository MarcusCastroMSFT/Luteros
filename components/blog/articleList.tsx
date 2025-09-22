import React from 'react';
import ArticleCard from './articleCard';
import { ArticleListProps } from '@/types/blog';
import { sampleArticles } from '@/data/articles';

export default function ArticleList({ articles = sampleArticles }: ArticleListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
