import React from 'react';
import ArticleCard from './articleCard';
import { ArticleListProps } from '@/types/blog';

export default function ArticleList({ articles = [] }: ArticleListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
