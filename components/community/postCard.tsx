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
              <h3 className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary">
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
