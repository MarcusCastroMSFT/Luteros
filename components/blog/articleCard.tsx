import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { BrandIcon } from '@/components/brand/brand-icon';
import { ArticleCardProps } from '@/types/blog';
import { ArticleAccessBadge, ArticleAudienceBadge } from './article-access-badges';

// Re-export types for convenience
export type { Article, ArticleCardProps } from '@/types/blog';

export default function ArticleCard({ article, priority = false }: ArticleCardProps & { priority?: boolean }) {
  const hasImage = article.image && article.image.trim() !== '';
  const hasAccessBadge = article.accessType === 'paid' || article.targetAudience === 'doctors';

  return (
    <article className="overflow-hidden group">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg aspect-[4/3] md:aspect-[16/10]">
          {hasImage ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={85}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#eee5ec]/60">
              <BrandIcon kind="articles" className="size-32 md:size-40" />
            </div>
          )}

          {/* Access badges overlay */}
          {hasAccessBadge && (
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              <ArticleAccessBadge accessType={article.accessType} className="backdrop-blur" />
              <ArticleAudienceBadge audience={article.targetAudience} className="backdrop-blur" />
            </div>
          )}
        </div>
      </Link>
      
      <div className="pt-4 md:pt-6">
        <Link href={`/articles/${article.slug}`}>
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
