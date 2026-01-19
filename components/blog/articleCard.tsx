import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight, FileText } from 'lucide-react';
import { ArticleCardProps } from '@/types/blog';

// Re-export types for convenience
export type { Article, ArticleCardProps } from '@/types/blog';

export default function ArticleCard({ article }: ArticleCardProps) {
  const hasImage = article.image && article.image.trim() !== '';
  
  return (
    <div className="overflow-hidden">
      <Link href={`/blog/${article.slug}`}>
        <div className="relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg group">
          {hasImage ? (
            <Image
              src={article.image}
              alt={article.title}
              width={400}
              height={240}
              className="w-full h-60 object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-60 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105">
              <FileText className="w-16 h-16 text-amber-400/60 dark:text-amber-500/40 mb-2" strokeWidth={1.5} />
              <span className="text-sm text-amber-600/60 dark:text-amber-400/50 font-medium">Artigo</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="pt-6">
        <Link href={`/blog/${article.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 hover:text-primary transition-colors cursor-pointer group inline-flex items-center gap-2">
            <span>{article.title}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
        </Link>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{article.date}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="hover:text-primary transition-colors cursor-pointer">{article.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
