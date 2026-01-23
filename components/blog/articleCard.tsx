import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, FileText } from 'lucide-react';
import { ArticleCardProps } from '@/types/blog';

// Re-export types for convenience
export type { Article, ArticleCardProps } from '@/types/blog';

export default function ArticleCard({ article }: ArticleCardProps) {
  const hasImage = article.image && article.image.trim() !== '';
  
  return (
    <article className="overflow-hidden group">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg aspect-[4/3] md:aspect-[16/10]">
          {hasImage ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-brand-100 to-brand-secondary-50 flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105">
              <FileText className="w-12 h-12 md:w-16 md:h-16 text-amber-400/60 mb-2" strokeWidth={1.5} />
              <span className="text-xs md:text-sm text-amber-600/60 font-medium">Artigo</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="pt-4 md:pt-6">
        <Link href={`/blog/${article.slug}`}>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3 hover:text-primary transition-colors cursor-pointer line-clamp-2">
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.date}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="hover:text-primary transition-colors cursor-pointer truncate max-w-[120px] md:max-w-none">{article.author}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
