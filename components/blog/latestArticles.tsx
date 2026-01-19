import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ArticleList from './articleList';
import { LatestArticlesProps } from '@/types/blog';

export function LatestArticles({ articles, limit = 12 }: LatestArticlesProps) {
  const articlesToShow = articles ? articles.slice(0, limit) : [];
  
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-[1428px]">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-cardo">
              Últimas do <span className="text-primary">Blog</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
              Artigos sobre educação sexual e saúde íntima.
            </p>
          </div>
          
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
          >
            <span className="font-medium">Ver Todos os Artigos</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* Articles Grid */}
        <ArticleList articles={articlesToShow} />
      </div>
    </section>
  );
}
