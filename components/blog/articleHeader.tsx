import React from 'react';
import Image from 'next/image';
import { Calendar, User, Clock, MessageCircle } from 'lucide-react';

interface ArticleHeaderProps {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  commentCount?: number;
}

export function ArticleHeader({
  title,
  excerpt,
  image,
  category,
  author,
  date,
  readTime,
  commentCount = 0
}: ArticleHeaderProps) {
  return (
    <div className="mb-12">
      {/* Category Badge */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-cardo leading-tight">
        {title}
      </h1>

      {/* Excerpt */}
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
        {excerpt}
      </p>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 text-sm mb-8">
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

      {/* Featured Image */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
