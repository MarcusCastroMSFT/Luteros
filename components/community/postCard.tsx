'use client';

import { Heart, MessageSquare, MoreHorizontal, Flag } from 'lucide-react';
import { CommunityPost } from '@/types/community';

interface PostCardProps {
  post: CommunityPost;
  onViewReplies: (post: CommunityPost) => void;
  onReport: (postId: string, author: string) => void;
  isReported: boolean;
  showFullContent?: boolean;
}

export function PostCard({ 
  post, 
  onViewReplies, 
  onReport, 
  isReported, 
  showFullContent = false 
}: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-orange-600 dark:text-orange-400 font-medium text-sm">
            {post.isAnonymous ? 'A' : post.author.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-primary">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span>{post.isAnonymous ? 'Anônimo' : post.author}</span>
                <span>•</span>
                <span>{formatDate(post.createdDate)}</span>
                <span>•</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {post.subcategory}
                </span>
              </div>
              <p className={`text-gray-600 dark:text-gray-300 mb-4 ${!showFullContent ? 'line-clamp-3' : ''}`}>
                {post.content}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <button className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
              <Heart size={16} />
              <span>{post.likes}</span>
            </button>
            <button 
              onClick={() => onViewReplies(post)}
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Ver {post.repliesCount} respostas</span>
            </button>
            <button 
              onClick={() => onReport(post.id, post.author)}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                isReported 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'hover:text-red-500 dark:hover:text-red-400'
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
