import React from 'react';
import Link from 'next/link';
import type { PopularArticle } from '@/types/help';

interface PopularArticlesProps {
  articles: PopularArticle[];
}

export function PopularArticles({ articles }: PopularArticlesProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Artigos Mais Populares
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.map((article, index) => (
          <Link
            key={index}
            href={article.href}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-cta-highlight hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="font-medium text-gray-900 group-hover:text-cta-highlight transition-colors mb-2">
              {article.title}
            </h3>
            <p className="text-xs text-gray-500">
              {article.views}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
