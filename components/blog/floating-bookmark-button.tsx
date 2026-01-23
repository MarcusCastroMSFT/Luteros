'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface FloatingBookmarkButtonProps {
  articleId: string;
  showAfterScroll?: number; // pixels to scroll before showing
}

export function FloatingBookmarkButton({ 
  articleId, 
  showAfterScroll = 400,
}: FloatingBookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

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

  return (
    <div
      className={cn(
        'fixed top-24 right-6 z-50 transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isBookmarked ? 'default' : 'outline'}
              size="lg"
              onClick={handleToggleBookmark}
              disabled={isLoading || isChecking}
              className={cn(
                'h-14 w-14 rounded-full shadow-lg cursor-pointer',
                'hover:scale-105 transition-transform',
                isBookmarked 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              )}
            >
              <Bookmark 
                className={cn(
                  'h-6 w-6 transition-all',
                  isBookmarked ? 'fill-current text-white' : 'text-gray-600'
                )} 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            <p>{isBookmarked ? 'Remover dos salvos' : 'Salvar artigo'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
