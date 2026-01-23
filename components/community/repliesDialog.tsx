'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Heart, Flag, MoreHorizontal, User, UserX, Send, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CommunityPost, CommunityReply } from '@/types/community';
import { ReportDialog } from './reportDialog';

interface RepliesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onReplyAdded?: (postId: string, reply: CommunityReply) => void;
  onReplyDeleted?: (postId: string, replyId: string) => void;
  onPostLiked?: (postId: string, liked: boolean, likeCount: number) => void;
  isPostLikedInitial?: boolean;
  isAdmin?: boolean;
}

export function RepliesDialog({ isOpen, onClose, post, onReplyAdded, onReplyDeleted, onPostLiked, isPostLikedInitial = false, isAdmin = false }: RepliesDialogProps) {
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

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    replyId: string;
    replyAuthor: string;
  }>({
    isOpen: false,
    replyId: '',
    replyAuthor: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedReplies, setDeletedReplies] = useState<Set<string>>(new Set());

  // Report details state (for admin)
  interface ReportDetails {
    id: string;
    reason: string;
    reasonLabel: string;
    details: string | null;
    reporter: { id: string; name: string; avatar: string | null };
    createdDateFormatted: string;
  }
  const [postReports, setPostReports] = useState<ReportDetails[]>([]);
  const [replyReports, setReplyReports] = useState<Map<string, ReportDetails[]>>(new Map());
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch reports for admin when dialog opens
  useEffect(() => {
    if (isOpen && isAdmin && post) {
      fetchReports();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAdmin, post?.id]);

  const fetchReports = async () => {
    if (!post) return;
    
    setLoadingReports(true);
    try {
      // Fetch post reports
      if (post.isReported) {
        const postResponse = await fetch(`/api/community/reports?entityType=post&entityId=${post.id}`);
        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPostReports(postData.reports || []);
        }
      }

      // Fetch reply reports for reported replies
      const reportedReplies = post.replies.filter(r => r.isReported);
      if (reportedReplies.length > 0) {
        const replyReportsMap = new Map<string, ReportDetails[]>();
        for (const reply of reportedReplies) {
          const replyResponse = await fetch(`/api/community/reports?entityType=reply&entityId=${reply.id}`);
          if (replyResponse.ok) {
            const replyData = await replyResponse.json();
            if (replyData.reports?.length > 0) {
              replyReportsMap.set(reply.id, replyData.reports);
            }
          }
        }
        setReplyReports(replyReportsMap);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

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

  // Handle delete reply (admin only)
  const handleDeleteReply = async () => {
    if (!post || !deleteDialog.replyId) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/community/${post.id}/replies/${deleteDialog.replyId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        toast.error('Erro ao excluir resposta', {
          description: data.error || 'Tente novamente mais tarde.',
        });
        return;
      }
      
      // Mark reply as deleted locally
      setDeletedReplies(prev => new Set([...prev, deleteDialog.replyId]));
      
      // Notify parent component
      if (onReplyDeleted) {
        onReplyDeleted(post.id, deleteDialog.replyId);
      }
      
      toast.success('Resposta excluída', {
        description: 'A resposta foi removida com sucesso.',
      });
      
      setDeleteDialog({ isOpen: false, replyId: '', replyAuthor: '' });
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error('Erro ao excluir resposta', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Track dismissed reports for UI updates
  const [dismissedReports, setDismissedReports] = useState<Set<string>>(new Set());
  const [isDismissing, setIsDismissing] = useState(false);

  // Handle dismiss report (admin only) - marks the reply as not reported
  const handleDismissReport = async (replyId: string, entityType: 'post' | 'reply' = 'reply') => {
    if (!post) return;
    
    setIsDismissing(true);
    
    try {
      const response = await fetch(`/api/community/reports/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId: replyId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        toast.error('Erro ao dispensar denúncia', {
          description: data.error || 'Tente novamente mais tarde.',
        });
        return;
      }
      
      // Mark as dismissed locally
      setDismissedReports(prev => new Set([...prev, replyId]));
      
      // Remove from reply reports
      if (entityType === 'reply') {
        setReplyReports(prev => {
          const newMap = new Map(prev);
          newMap.delete(replyId);
          return newMap;
        });
      } else {
        setPostReports([]);
      }
      
      toast.success('Denúncia dispensada', {
        description: 'O conteúdo foi marcado como apropriado.',
      });
    } catch (error) {
      console.error('Failed to dismiss report:', error);
      toast.error('Erro ao dispensar denúncia', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsDismissing(false);
    }
  };

  const handleReportSubmit = async (reason: string, details: string) => {
    if (!post) return;
    
    try {
      const response = await fetch('/api/community/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType: reportDialog.itemType,
          entityId: reportDialog.itemId,
          reason,
          details,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          toast.info('Você já reportou este item');
        } else {
          toast.error('Erro ao enviar reporte', {
            description: data.error || 'Tente novamente mais tarde.',
          });
        }
        return;
      }

      const newReported = new Set(reportedItems);
      newReported.add(reportDialog.itemId);
      setReportedItems(newReported);
      
      toast.success('Reporte enviado!', {
        description: 'Obrigado por ajudar a manter a comunidade segura.',
      });
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Erro ao enviar reporte', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setReportDialog({ isOpen: false, itemId: '', itemType: 'reply', itemAuthor: '' });
    }
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
    setDeletedReplies(new Set());
    setPostReports([]);
    setReplyReports(new Map());
    onClose();
  };

  // Don't render if no post is provided
  if (!post) {
    return null;
  }

  // Combine original replies with locally added ones, filter out deleted ones
  const allReplies = [...post.replies, ...localReplies].filter(reply => !deletedReplies.has(reply.id));
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

          {/* Post Report Details (Admin Only) */}
          {isAdmin && post.isReported && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-1 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-600" />
                <h4 className="text-sm font-semibold text-red-700">Post Denunciado</h4>
              </div>
              {loadingReports ? (
                <p className="text-sm text-red-600">Carregando detalhes...</p>
              ) : postReports.length > 0 ? (
                <div className="space-y-3">
                  {postReports.map((report) => (
                    <div key={report.id} className="bg-white rounded border border-red-100 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-red-700">{report.reasonLabel}</span>
                        <span className="text-xs text-gray-500">{report.createdDateFormatted}</span>
                      </div>
                      {report.details && (
                        <p className="text-sm text-gray-700 mb-2">&quot;{report.details}&quot;</p>
                      )}
                      <p className="text-xs text-gray-500">Reportado por: {report.reporter.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-600">Nenhum detalhe de denúncia encontrado.</p>
              )}
            </div>
          )}

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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      reply.isReported ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <span className={`font-medium text-xs ${
                        reply.isReported ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {reply.isAnonymous ? 'A' : reply.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Reply Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`rounded-lg p-3 ${
                        reply.isReported && !dismissedReports.has(reply.id)
                          ? 'bg-red-50 border border-red-200' 
                          : dismissedReports.has(reply.id)
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className={`font-medium ${reply.isReported && !dismissedReports.has(reply.id) ? 'text-red-700' : 'text-gray-900'}`}>
                              {reply.isAnonymous ? 'Anônimo' : reply.author}
                            </span>
                            {reply.isReported && !dismissedReports.has(reply.id) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                <AlertTriangle size={10} />
                                Denunciado
                              </span>
                            )}
                            {dismissedReports.has(reply.id) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle size={10} />
                                Aprovado
                              </span>
                            )}
                            <span>•</span>
                            <span>{formatDate(reply.createdDate)}</span>
                          </div>
                          {isAdmin ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                                  <MoreHorizontal size={16} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(reply.isReported && !dismissedReports.has(reply.id)) && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDismissReport(reply.id, 'reply')}
                                    disabled={isDismissing}
                                    className="text-green-600 focus:text-green-600 cursor-pointer"
                                  >
                                    <CheckCircle size={14} className="mr-2" />
                                    Dispensar denúncia
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => setDeleteDialog({
                                    isOpen: true,
                                    replyId: reply.id,
                                    replyAuthor: reply.author
                                  })}
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Excluir resposta
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
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
                              reportedItems.has(reply.id) || reply.isReported
                                ? 'text-red-500' 
                                : 'hover:text-red-500'
                            }`}
                            disabled={reportedItems.has(reply.id) || reply.isReported}
                          >
                            <Flag size={14} />
                            <span>{reportedItems.has(reply.id) || reply.isReported ? 'Denunciado' : 'Reportar'}</span>
                          </button>
                        </div>

                        {/* Reply Report Details (Admin Only) */}
                        {isAdmin && reply.isReported && replyReports.has(reply.id) && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-xs font-medium text-red-700 mb-2">Motivo da denúncia:</p>
                            {replyReports.get(reply.id)?.map((report) => (
                              <div key={report.id} className="text-xs text-red-600 mb-1">
                                <span className="font-medium">{report.reasonLabel}</span>
                                {report.details && (
                                  <span className="text-gray-600"> - &quot;{report.details}&quot;</span>
                                )}
                                <span className="text-gray-500 ml-2">({report.reporter.name})</span>
                              </div>
                            ))}
                          </div>
                        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, replyId: '', replyAuthor: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir resposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A resposta de &quot;{deleteDialog.replyAuthor}&quot; será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReply}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
