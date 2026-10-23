import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ArticleList from './articleList';
import { LatestArticlesProps } from '@/types/blog';

export function LatestArticles({ articles, limit = 12 }: LatestArticlesProps) {
  const articlesToShow = articles ? articles.slice(0, limit) : [];
  
  return (
    <section aria-labelledby="home-articles-title" className="relative isolate overflow-hidden border-y border-brand-600/10 bg-[#f1f4ef] py-20 lg:py-28">
      <Image src="/images/brand/care-orbits.svg" alt="" aria-hidden="true" width={180} height={240} unoptimized className="pointer-events-none absolute -right-12 -top-20 hidden h-auto w-48 rotate-[-45deg] opacity-30 lg:block" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10 lg:px-12">
        {/* Header Section */}
        <div data-reveal="" suppressHydrationWarning className="mb-14 flex flex-col lg:mb-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h2 id="home-articles-title" className="mb-6 font-[family-name:var(--font-cardo)] text-4xl leading-[1.12] text-brand-900 lg:text-[52px]">
              Últimos <span className="italic text-brand-600">Artigos</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-md">
              Artigos sobre educação sexual e saúde íntima.
            </p>
          </div>
          
          <Link 
            href="/articles"
            className="group inline-flex min-h-11 w-fit items-center gap-3 rounded-sm text-brand-700 transition-colors hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 motion-reduce:transition-none"
          >
            <span className="font-medium">Ver Todos os Artigos</span>
            <ArrowRight className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        
        {/* Articles Grid */}
        <ArticleList articles={articlesToShow} />
      </div>
    </section>
  );
}
