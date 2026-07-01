'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, User, Clock, MessageCircle, X, ZoomIn } from 'lucide-react';
import { ArticleBookmarkButton } from './article-bookmark-button';
import { ArticleAccessBadge, ArticleAudienceBadge } from './article-access-badges';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="mb-12">
      {/* Category + access badges */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
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
        <>
          <button
            type="button"
            className="w-full rounded-lg overflow-hidden bg-gray-200 block cursor-zoom-in relative group"
            onClick={() => setLightboxOpen(true)}
            aria-label="Ampliar imagem"
          >
            {image.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                className="w-full h-auto block"
                loading="eager"
              />
            ) : (
              <Image
                src={image}
                alt={title}
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="w-full h-auto block"
                priority
                quality={85}
              />
            )}
            {/* Zoom hint overlay */}
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
              <span className="bg-black/50 text-white rounded-full p-2">
                <ZoomIn className="w-5 h-5" />
              </span>
            </span>
          </button>

          {/* Lightbox */}
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit p-0 bg-black/90 border-none overflow-auto">
              <DialogClose className="absolute right-3 top-3 z-10 rounded-full bg-black/60 text-white p-1.5 hover:bg-black/80 transition-colors">
                <X className="w-5 h-5" />
                <span className="sr-only">Fechar</span>
              </DialogClose>
              {image.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={title}
                  className="max-w-[95vw] max-h-[95vh] w-auto h-auto block"
                />
              ) : (
                <Image
                  src={image}
                  alt={title}
                  width={0}
                  height={0}
                  sizes="95vw"
                  className="max-w-[95vw] max-h-[95vh] w-auto h-auto block"
                  quality={95}
                  unoptimized={false}
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
