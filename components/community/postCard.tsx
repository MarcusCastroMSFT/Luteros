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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-cta-highlight font-medium text-sm">
            {post.isAnonymous ? 'A' : post.author.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 
                onClick={() => onViewReplies(getUpdatedPost())}
                className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary transition-colors"
              >
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <span>{post.isAnonymous ? 'Anônimo' : post.author}</span>
                <span>•</span>
                <span>{formatDate(post.createdDate)}</span>
                <span>•</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {post.subcategory}
                </span>
              </div>
              <p className={`text-gray-600 mb-4 ${!showFullContent ? 'line-clamp-3' : ''}`}>
                {post.content}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                isLiked 
                  ? 'text-red-500' 
                  : 'hover:text-red-500'
              } ${isLiking ? 'opacity-50' : ''}`}
            >
              <Heart size={16} className={isLiked ? 'fill-current' : ''} />
              <span>{likeCount}</span>
            </button>
            <button 
              onClick={() => onViewReplies(getUpdatedPost())}
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Ver {post.repliesCount} respostas</span>
            </button>
            <button 
              onClick={() => onReport(post.id, post.author)}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                isReported 
                  ? 'text-red-500' 
                  : 'hover:text-red-500'
              }`}
              disabled={isReported}
            >
              <Flag size={16} />
              <span>{isReported ? 'Reportado' : 'Reportar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
