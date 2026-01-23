'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, User, ArrowRight, Bookmark, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { type SavedArticle } from '@/app/api/users/saved-articles/route';

interface SavedArticleCardProps {
  savedArticle: SavedArticle;
  onRemove?: (articleId: string) => void;
}

export function SavedArticleCard({ savedArticle, onRemove }: SavedArticleCardProps) {
  const { article, savedAt } = savedArticle;
  const [isRemoving, setIsRemoving] = useState(false);

  // Format saved date
  const formatSavedAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRemoveBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRemoving(true);

    try {
      const response = await fetch(`/api/articles/${article.id}/bookmark`, {
        method: 'POST',
      });

      if (!response.ok) {
        toast.error('Erro ao remover artigo dos salvos');
        return;
      }

      onRemove?.(article.id);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Erro ao remover artigo dos salvos');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Article Image */}
      <Link href={`/blog/${article.slug}`} className="block relative">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-700">
              {article.category}
            </Badge>
          </div>
          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveBookmark}
            disabled={isRemoving}
            className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            title="Remover dos salvos"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      {/* Article Content */}
      <div className="p-5">
        {/* Title */}
        <Link href={`/blog/${article.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{article.readTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="truncate max-w-[100px]">{article.author.name}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Bookmark className="w-3 h-3" />
            <span>Salvo em {formatSavedAt(savedAt)}</span>
          </div>
          <Button asChild size="sm" variant="ghost" className="text-primary">
            <Link href={`/blog/${article.slug}`} className="flex items-center gap-1">
              Ler
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
