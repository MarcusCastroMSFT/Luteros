'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { CommunityPost } from '@/types/community';

interface PostCardProps {
  post: CommunityPost;
  onViewReplies: (post: CommunityPost) => void;
  onReport: (postId: string, author: string) => void;
  isReported: boolean;
  isLiked?: boolean;
  showFullContent?: boolean;
  onLikeChanged?: (postId: string, liked: boolean, likeCount: number) => void;
}

export function PostCard({ 
  post, 
  onViewReplies, 
  onReport, 
  isReported,
  isLiked: externalIsLiked = false,
  showFullContent = false,
  onLikeChanged
}: PostCardProps) {
  // Use external like state as the source of truth when provided
  const [internalIsLiked, setInternalIsLiked] = useState(externalIsLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);

  // The actual like state - prefer external if tracking is enabled
  const isLiked = externalIsLiked !== undefined ? externalIsLiked : internalIsLiked;

  // Sync state with props when they change (e.g., after dialog interaction)
  useEffect(() => {
    setLikeCount(post.likes);
  }, [post.likes]);

  // Sync internal state when external changes
  useEffect(() => {
    setInternalIsLiked(externalIsLiked);
  }, [externalIsLiked]);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    
    // Optimistic update
    const wasLiked = isLiked;
    setInternalIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    try {
      const response = await fetch(`/api/community/${post.id}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        // Revert on error
        setInternalIsLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
        
        if (response.status === 401) {
          toast.error('Faça login para curtir posts', {
            description: 'Você precisa estar logado para interagir com a comunidade.',
          });
        } else {
          toast.error('Erro ao processar curtida');
        }
      } else {
        const data = await response.json();
        setLikeCount(data.likeCount);
        setInternalIsLiked(data.liked);
        
        // Notify parent of like change
        if (onLikeChanged) {
          onLikeChanged(post.id, data.liked, data.likeCount);
        }
        
        if (data.liked) {
          toast.success('Post curtido!', {
            description: 'Você curtiu este post.',
          });
        } else {
          toast.info('Curtida removida', {
            description: 'Você removeu sua curtida deste post.',
          });
        }
      }
    } catch (error) {
      // Revert on error
      setInternalIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Failed to like post:', error);
      toast.error('Erro ao processar curtida', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsLiking(false);
    }
  };

  // The createdDate is already formatted from the server, so we just use it directly
  // If it's an ISO date string, format it; otherwise use as-is
  const formatDate = (dateString: string) => {
    // Check if it's already a formatted date string (contains month names)
    if (/[a-zA-Z]/.test(dateString)) {
      return dateString;
    }
    // Otherwise try to parse as ISO date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Create updated post with current like count for passing to dialog
  const getUpdatedPost = (): CommunityPost => ({
    ...post,
    likes: likeCount,
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex items-start gap-3 md:gap-4">
        {/* Avatar */}
        <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-cta-highlight font-medium text-xs md:text-sm">
            {post.isAnonymous ? 'A' : post.author.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 
                onClick={() => onViewReplies(getUpdatedPost())}
                className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2"
              >
                {post.title}
              </h3>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                <span>{post.isAnonymous ? 'Anônimo' : post.author}</span>
                <span className="hidden sm:inline">•</span>
                <span>{formatDate(post.createdDate)}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 md:py-1 rounded hidden sm:inline-block">
                  {post.subcategory}
                </span>
              </div>
              <p className={`text-sm md:text-base text-gray-600 mb-3 md:mb-4 ${!showFullContent ? 'line-clamp-2 md:line-clamp-3' : ''}`}>
                {post.content}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer shrink-0">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Actions - Compact on mobile */}
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 md:gap-2 transition-colors cursor-pointer ${
                isLiked 
                  ? 'text-red-500' 
                  : 'hover:text-red-500'
              } ${isLiking ? 'opacity-50' : ''}`}
            >
              <Heart size={14} className={`md:w-4 md:h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button 
              onClick={() => onViewReplies(getUpdatedPost())}
              className="flex items-center gap-1.5 md:gap-2 hover:text-primary transition-colors cursor-pointer"
            >
              <MessageSquare size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Ver </span>
              <span>{post.repliesCount}</span>
              <span className="hidden sm:inline"> respostas</span>
            </button>
            <button 
              onClick={() => onReport(post.id, post.author)}
              className={`flex items-center gap-1.5 md:gap-2 transition-colors cursor-pointer ${
                isReported 
                  ? 'text-red-500' 
                  : 'hover:text-red-500'
              }`}
              disabled={isReported}
            >
              <Flag size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">{isReported ? 'Reportado' : 'Reportar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
