import React from 'react';
import Image from 'next/image';
import { Calendar, User, Clock, MessageCircle } from 'lucide-react';
import { ArticleBookmarkButton } from './article-bookmark-button';

interface ArticleHeaderProps {
  articleId?: string;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  commentCount?: number;
}

export function ArticleHeader({
  articleId,
  title,
  excerpt,
  image,
  category,
  author,
  date,
  readTime,
  commentCount = 0
}: ArticleHeaderProps) {
  const hasImage = image && image.trim() !== '';
  
  return (
    <div className="mb-12">
      {/* Category Badge */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-cardo leading-tight">
        {title}
      </h1>

      {/* Excerpt */}
      <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
        {excerpt}
      </p>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{readTime}</span>
          </div>
          {commentCount > 0 && (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount} comentários</span>
            </div>
          )}
        </div>
        {articleId && <ArticleBookmarkButton articleId={articleId} />}
      </div>

      {/* Featured Image - Only show if image exists */}
      {hasImage && (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden bg-gray-200">
          {image.startsWith('data:') ? (
            // Use regular img tag for data URLs (base64)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            // Use Next.js Image for external URLs with optimizations
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
            />
          )}
        </div>
      )}
    </div>
  );
}
