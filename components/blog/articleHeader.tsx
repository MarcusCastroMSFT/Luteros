import React from 'react';
import { Calendar, User, Clock, MessageCircle } from 'lucide-react';
import { ArticleBookmarkButton } from './article-bookmark-button';
import { ArticleAccessBadge, ArticleAudienceBadge } from './article-access-badges';
import { ArticleImageLightbox } from './article-image-lightbox';

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
  accessType?: 'free' | 'paid';
  targetAudience?: 'general' | 'doctors';
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
  commentCount = 0,
  accessType,
  targetAudience,
}: ArticleHeaderProps) {
  const hasImage = image && image.trim() !== '';

  return (
    <div className="mb-12">
      {/* Category + access badges */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-brand-700 rounded-full text-xs font-medium">
          {category}
        </span>
        <ArticleAccessBadge accessType={accessType} />
        <ArticleAudienceBadge audience={targetAudience} />
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-cardo leading-tight">
        {title}
      </h1>

      {/* Excerpt */}
      <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed text-justify hyphens-auto">
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
        <ArticleImageLightbox src={image} alt={title} />
      )}
    </div>
  );
}
