'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Heart, Flag, MoreHorizontal, User, UserX, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CommunityPost, CommunityReply } from '@/types/community';
import { ReportDialog } from './reportDialog';

interface RepliesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onReplyAdded?: (postId: string, reply: CommunityReply) => void;
  onPostLiked?: (postId: string, liked: boolean, likeCount: number) => void;
  isPostLikedInitial?: boolean;
}

export function RepliesDialog({ isOpen, onClose, post, onReplyAdded, onPostLiked, isPostLikedInitial = false }: RepliesDialogProps) {
  const [reportedItems, setReportedItems] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [localReplies, setLocalReplies] = useState<CommunityReply[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const repliesContainerRef = useRef<HTMLDivElement>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // Post like state
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [isLikingPost, setIsLikingPost] = useState(false);
  
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

  // Initialize post like count and state when post changes or dialog opens
  useEffect(() => {
    if (post && isOpen) {
      setPostLikeCount(post.likes);
      setIsPostLiked(isPostLikedInitial);
    }
  }, [post?.id, post?.likes, isOpen, isPostLikedInitial]);

  // Scroll to bottom when new replies are added
  useEffect(() => {
    if (localReplies.length > 0 && repliesContainerRef.current) {
      repliesContainerRef.current.scrollTop = repliesContainerRef.current.scrollHeight;
    }
  }, [localReplies.length]);

  // Handle post like
  const handlePostLike = async () => {
    if (isLikingPost || !post) return;
    
    setIsLikingPost(true);
    
    // Optimistic update
    const wasLiked = isPostLiked;
    setIsPostLiked(!wasLiked);
    setPostLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    try {
      const response = await fetch(`/api/community/${post.id}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        // Revert on error
        setIsPostLiked(wasLiked);
        setPostLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
        
        if (response.status === 401) {
          toast.error('Faça login para curtir posts', {
            description: 'Você precisa estar logado para interagir com a comunidade.',
          });
        } else {
          toast.error('Erro ao processar curtida');
        }
      } else {
        const data = await response.json();
        setPostLikeCount(data.likeCount);
        setIsPostLiked(data.liked);
        
        // Notify parent component
        if (onPostLiked) {
          onPostLiked(post.id, data.liked, data.likeCount);
        }
        
        if (data.liked) {
          toast.success('Post curtido!');
        } else {
          toast.info('Curtida removida');
        }
      }
    } catch (error) {
      // Revert on error
      setIsPostLiked(wasLiked);
      setPostLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Failed to like post:', error);
      toast.error('Erro ao processar curtida');
    } finally {
      setIsLikingPost(false);
    }
  };

  // The date is already formatted from the server, so we just use it directly
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleLike = (replyId: string) => {
    const newLiked = new Set(likedReplies);
    if (newLiked.has(replyId)) {
      newLiked.delete(replyId);
      toast.info('Curtida removida', {
        description: 'Você removeu sua curtida desta resposta.',
      });
    } else {
      newLiked.add(replyId);
      toast.success('Resposta curtida!', {
        description: 'Você curtiu esta resposta.',
      });
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

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !post) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/community/${post.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          isAnonymous,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Faça login para responder', {
            description: 'Você precisa estar logado para responder posts.',
          });
        } else {
          toast.error('Erro ao enviar resposta', {
            description: 'Tente novamente mais tarde.',
          });
        }
        return;
      }

      const data = await response.json();
      
      // Add the new reply to local state
      setLocalReplies(prev => [...prev, data.reply]);
      
      // Notify parent component
      if (onReplyAdded) {
        onReplyAdded(post.id, data.reply);
      }
      
      toast.success('Resposta enviada!', {
        description: isAnonymous ? 'Sua resposta foi publicada anonimamente.' : 'Sua resposta foi publicada.',
      });

      // Reset form
      setReplyContent('');
      setIsAnonymous(false);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to submit reply:', error);
      toast.error('Erro ao enviar resposta', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setReplyContent('');
    setIsAnonymous(false);
    setShowReplyForm(false);
    setLocalReplies([]);
    onClose();
  };

  // Don't render if no post is provided
  if (!post) {
    return null;
  }

  // Combine original replies with locally added ones
  const allReplies = [...post.replies, ...localReplies];
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
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
                  <button 
                    onClick={handlePostLike}
                    disabled={isLikingPost}
                    className={`flex items-center gap-2 transition-colors cursor-pointer ${
                      isPostLiked 
                        ? 'text-red-500' 
                        : 'hover:text-red-500'
                    } ${isLikingPost ? 'opacity-50' : ''}`}
                  >
                    <Heart size={16} className={isPostLiked ? 'fill-current' : ''} />
                    <span>{postLikeCount}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>{post.repliesCount + localReplies.length} respostas</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Replies Content */}
          <div className="flex-1 py-4 min-h-0" style={{ maxHeight: 'calc(85vh - 280px)' }}>
            {allReplies.length === 0 ? (
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
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-1 flex-shrink-0 mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Respostas ({allReplies.length})
                  </h3>
                  {allReplies.length > 5 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span>Role para ver todas</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </span>
                  )}
                </div>
                
                {/* Scrollable replies container */}
                <div 
                  ref={repliesContainerRef}
                  className="space-y-3 flex-1 pr-2 custom-scrollbar overflow-y-auto"
                  style={{ maxHeight: 'calc(85vh - 350px)' }}
                >
                {allReplies.map((reply) => (
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

          {/* Reply Form */}
          {showReplyForm ? (
            <div className="border-t border-gray-200 pt-4 space-y-4 flex-shrink-0 bg-white">
              {/* Anonymous toggle */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Responder como:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(false)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      !isAnonymous
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <User size={14} />
                    Você
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isAnonymous
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <UserX size={14} />
                    Anônimo
                  </button>
                </div>
              </div>
              
              {/* Reply textarea */}
              <div className="flex gap-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={3}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  maxLength={2000}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{replyContent.length}/2000</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                      setIsAnonymous(false);
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    <Send size={16} className="mr-2" />
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Footer Actions */
            <div className="border-t border-gray-200 pt-4 flex-shrink-0 bg-white">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => setShowReplyForm(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Responder
                </Button>
              </div>
            </div>
          )}
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
