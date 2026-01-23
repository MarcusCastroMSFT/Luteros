'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface ArticleBookmarkButtonProps {
  articleId: string;
  className?: string;
  variant?: 'default' | 'icon';
  size?: 'sm' | 'default' | 'lg';
}

export function ArticleBookmarkButton({ 
  articleId, 
  className,
  variant = 'default',
  size = 'default',
}: ArticleBookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if article is bookmarked on mount
  useEffect(() => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    const checkBookmark = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/bookmark`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsBookmarked(data.data.isBookmarked);
          }
        }
      } catch (error) {
        console.error('Error checking bookmark:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkBookmark();
  }, [articleId, user]);

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar artigos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/articles/${articleId}/bookmark`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao salvar artigo');
        return;
      }

      setIsBookmarked(data.data.isBookmarked);
      
      if (data.data.isBookmarked) {
        toast.success('Artigo salvo!');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Erro ao salvar artigo');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleBookmark}
        disabled={isLoading || isChecking}
        className={cn(
          "transition-colors cursor-pointer",
          isBookmarked && "text-primary",
          className
        )}
        title={isBookmarked ? 'Remover dos salvos' : 'Salvar artigo'}
      >
        <Bookmark 
          className={cn(
            "h-5 w-5 transition-all",
            isBookmarked && "fill-current"
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isBookmarked ? 'default' : 'outline'}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isLoading || isChecking}
      className={cn(
        "gap-2 transition-all cursor-pointer",
        className
      )}
    >
      <Bookmark 
        className={cn(
          "h-4 w-4",
          isBookmarked && "fill-current"
        )} 
      />
      {isBookmarked ? 'Salvo' : 'Salvar'}
    </Button>
  );
}
