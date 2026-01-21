'use client';

import { useState } from 'react';
import { MessageSquare, Heart, Flag, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CommunityPost } from '@/types/community';
import { ReportDialog } from './reportDialog';

interface RepliesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
}

export function RepliesDialog({ isOpen, onClose, post }: RepliesDialogProps) {
  const [reportedItems, setReportedItems] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [reportDialog, setReportDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: 'post' | 'reply';
    itemAuthor: string;
  }>({
    isOpen: false,
    itemId: '',
    itemType: 'reply',
    itemAuthor: ''
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleLike = (replyId: string) => {
    const newLiked = new Set(likedReplies);
    if (newLiked.has(replyId)) {
      newLiked.delete(replyId);
    } else {
      newLiked.add(replyId);
    }
    setLikedReplies(newLiked);
  };

  const reportItem = (itemId: string, author: string) => {
    if (reportedItems.has(itemId)) return;
    
    setReportDialog({
      isOpen: true,
      itemId,
      itemType: 'reply',
      itemAuthor: author
    });
  };

  const handleReportSubmit = (reason: string, details: string) => {
    const newReported = new Set(reportedItems);
    newReported.add(reportDialog.itemId);
    setReportedItems(newReported);
    
    console.log(`Reported reply ${reportDialog.itemId}:`, { reason, details });
    
    setReportDialog({ isOpen: false, itemId: '', itemType: 'reply', itemAuthor: '' });
  };

  const handleReportClose = () => {
    setReportDialog({ isOpen: false, itemId: '', itemType: 'reply', itemAuthor: '' });
  };

  // Don't render if no post is provided
  if (!post) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] bg-white border border-gray-200 flex flex-col">
          <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
            <div className="flex items-start gap-4">
              {/* Original Post Avatar */}
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 font-medium text-sm">
                  {post.isAnonymous ? 'A' : post.author.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>{post.isAnonymous ? 'Anônimo' : post.author}</span>
                  <span>•</span>
                  <span>{formatDate(post.createdDate)}</span>
                  <span>•</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {post.subcategory}
                  </span>
                </div>
                <DialogDescription className="text-gray-600 text-sm line-clamp-3">
                  {post.content}
                </DialogDescription>
                
                {/* Post Actions */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Heart size={16} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>{post.repliesCount} respostas</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Replies Content */}
          <div className="flex-1 py-4 min-h-0">
            {post.replies.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">
                  Ainda não há respostas
                </p>
                <p className="text-sm text-gray-400">
                  Seja o primeiro a responder este post
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    Respostas ({post.repliesCount})
                  </h3>
                  {post.replies.length > 5 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span>Role para ver todas</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </span>
                  )}
                </div>
                
                {/* Scrollable replies container */}
                <div className="space-y-3 max-h-[calc(60vh-2rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    {/* Reply Avatar */}
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-medium text-xs">
                        {reply.isAnonymous ? 'A' : reply.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Reply Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {reply.isAnonymous ? 'Anônimo' : reply.author}
                            </span>
                            <span>•</span>
                            <span>{formatDate(reply.createdDate)}</span>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        
                        <p className="text-gray-900 text-sm mb-3">
                          {reply.content}
                        </p>
                        
                        {/* Reply Actions */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button 
                            onClick={() => toggleLike(reply.id)}
                            className={`flex items-center gap-2 transition-colors cursor-pointer ${
                              likedReplies.has(reply.id) 
                                ? 'text-red-500' 
                                : 'hover:text-primary'
                            }`}
                          >
                            <Heart 
                              size={14} 
                              className={likedReplies.has(reply.id) ? 'fill-current' : ''} 
                            />
                            <span>
                              {reply.likes + (likedReplies.has(reply.id) ? 1 : 0)}
                            </span>
                          </button>
                          
                          <button 
                            onClick={() => reportItem(reply.id, reply.author)}
                            className={`flex items-center gap-2 transition-colors cursor-pointer ${
                              reportedItems.has(reply.id) 
                                ? 'text-red-500' 
                                : 'hover:text-red-500'
                            }`}
                            disabled={reportedItems.has(reply.id)}
                          >
                            <Flag size={14} />
                            <span>{reportedItems.has(reply.id) ? 'Reportado' : 'Reportar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Fechar
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                <MessageSquare size={16} className="mr-2" />
                Responder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={reportDialog.isOpen}
        onClose={handleReportClose}
        onSubmit={handleReportSubmit}
        itemType={reportDialog.itemType}
        itemAuthor={reportDialog.itemAuthor}
      />
    </>
  );
}
