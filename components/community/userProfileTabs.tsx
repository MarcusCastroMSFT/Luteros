'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Flag, Loader2, ExternalLink } from 'lucide-react';
import { CommunityPost } from '@/types/community';
import { ReportDialog } from './reportDialog';
import Link from 'next/link';

interface UserReply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  post: {
    id: string;
    title: string;
    category: string;
    subcategory: string | null;
  };
}

interface LikedPost {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string | null;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  author: {
    name: string;
    avatar: string | null;
  };
}

interface LikedReply {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  post: {
    id: string;
    title: string;
    category: string;
  };
  author: {
    name: string;
    avatar: string | null;
  };
}

interface UserProfileTabsProps {
  posts: CommunityPost[];
  initialTab?: 'posts' | 'replies' | 'bookmarks';
}

export function UserProfileTabs({ posts, initialTab = 'posts' }: UserProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'bookmarks'>(initialTab);
  const [reportedItems, setReportedItems] = useState<Set<string>>(new Set());
  const [reportDialog, setReportDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: 'post' | 'reply';
    itemAuthor: string;
  }>({
    isOpen: false,
    itemId: '',
    itemType: 'post',
    itemAuthor: ''
  });

  // Replies state
  const [replies, setReplies] = useState<UserReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesCount, setRepliesCount] = useState(0);

  // Favorites state
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [likedReplies, setLikedReplies] = useState<LikedReply[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Fetch user replies
  const fetchReplies = useCallback(async () => {
    if (repliesLoaded) return;
    
    setRepliesLoading(true);
    try {
      const response = await fetch('/api/community/replies');
      const data = await response.json();
      
      if (data.success) {
        setReplies(data.data);
        setRepliesCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setRepliesLoading(false);
      setRepliesLoaded(true);
    }
  }, [repliesLoaded]);

  // Fetch user favorites (liked posts and replies)
  const fetchFavorites = useCallback(async () => {
    if (favoritesLoaded) return;
    
    setFavoritesLoading(true);
    try {
      const response = await fetch('/api/community/favorites');
      const data = await response.json();
      
      if (data.success) {
        setLikedPosts(data.data.posts);
        setLikedReplies(data.data.replies);
        setFavoritesCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setFavoritesLoading(false);
      setFavoritesLoaded(true);
    }
  }, [favoritesLoaded]);

  // Update activeTab when initialTab prop changes (from sidebar navigation)
  // and trigger data fetch if needed
  useEffect(() => {
    setActiveTab(initialTab);
    
    // Immediately fetch data for the new tab if not already loaded
    if (initialTab === 'replies' && !repliesLoaded) {
      fetchReplies();
    }
    if (initialTab === 'bookmarks' && !favoritesLoaded) {
      fetchFavorites();
    }
  }, [initialTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load data when tab becomes active (via tab click)
  useEffect(() => {
    if (activeTab === 'replies' && !repliesLoaded) {
      fetchReplies();
    }
    if (activeTab === 'bookmarks' && !favoritesLoaded) {
      fetchFavorites();
    }
  }, [activeTab, repliesLoaded, favoritesLoaded, fetchReplies, fetchFavorites]);

  const tabs = [
    { id: 'posts' as const, label: 'Meus Posts', count: posts.length },
    { id: 'replies' as const, label: 'Minhas Respostas', count: repliesCount },
    { id: 'bookmarks' as const, label: 'Meus Favoritos', count: favoritesCount }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const reportItem = (itemId: string, author: string) => {
    if (reportedItems.has(itemId)) return;
    
    setReportDialog({
      isOpen: true,
      itemId,
      itemType: 'post',
      itemAuthor: author
    });
  };

  const handleReportSubmit = (reason: string, details: string) => {
    const newReported = new Set(reportedItems);
    newReported.add(reportDialog.itemId);
    setReportedItems(newReported);
    
    // In a real app, this would make an API call
    console.log(`Reported ${reportDialog.itemType} ${reportDialog.itemId}:`, { reason, details });
    
    setReportDialog({ isOpen: false, itemId: '', itemType: 'post', itemAuthor: '' });
  };

  const handleReportClose = () => {
    setReportDialog({ isOpen: false, itemId: '', itemType: 'post', itemAuthor: '' });
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-3 md:space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <div className="text-gray-500 mb-2 text-sm md:text-base">
                  Você ainda não criou nenhum post
                </div>
                <p className="text-xs md:text-sm text-gray-400">
                  Comece a participar da comunidade criando seu primeiro post
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                  <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary line-clamp-2">
                      {post.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                    <span>{formatDate(post.createdDate)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded hidden sm:inline-block">
                      {post.category}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded hidden sm:inline-block">
                      {post.subcategory}
                    </span>
                  </div>
                  
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Heart size={14} className="md:w-4 md:h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <MessageSquare size={14} className="md:w-4 md:h-4" />
                      <span>{post.repliesCount}</span>
                      <span className="hidden sm:inline"> respostas</span>
                    </div>
                    <button 
                      onClick={() => reportItem(post.id, post.author)}
                      className={`flex items-center gap-1.5 md:gap-2 transition-colors cursor-pointer ${
                        reportedItems.has(post.id) 
                          ? 'text-red-500' 
                          : 'hover:text-red-500'
                      }`}
                      disabled={reportedItems.has(post.id)}
                    >
                      <Flag size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">{reportedItems.has(post.id) ? 'Reportado' : 'Reportar'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      
      case 'replies':
        if (repliesLoading) {
          return (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        return (
          <div className="space-y-3 md:space-y-4">
            {replies.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <div className="text-gray-500 mb-2 text-sm md:text-base">
                  Você ainda não respondeu nenhum post
                </div>
                <p className="text-xs md:text-sm text-gray-400">
                  Participe das discussões respondendo aos posts da comunidade
                </p>
              </div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                  {/* Link to original post */}
                  <Link 
                    href={`/community/${reply.post.id}`}
                    className="flex items-center gap-2 text-xs md:text-sm text-primary hover:underline mb-2 md:mb-3"
                  >
                    <ExternalLink size={12} className="md:w-3.5 md:h-3.5 shrink-0" />
                    <span className="truncate">Em resposta a: {reply.post.title}</span>
                  </Link>
                  
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                    <span>{formatDate(reply.createdAt)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded hidden sm:inline-block">
                      {reply.post.category}
                    </span>
                    {reply.post.subcategory && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded hidden sm:inline-block">
                          {reply.post.subcategory}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                    {reply.content}
                  </p>
                  
                  <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Heart size={14} className="md:w-4 md:h-4" />
                      <span>{reply.likesCount}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      
      case 'bookmarks':
        if (favoritesLoading) {
          return (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        const hasNoFavorites = likedPosts.length === 0 && likedReplies.length === 0;

        return (
          <div className="space-y-4 md:space-y-6">
            {hasNoFavorites ? (
              <div className="text-center py-6 md:py-8">
                <div className="text-gray-500 mb-2 text-sm md:text-base">
                  Você ainda não curtiu nenhum post ou resposta
                </div>
                <p className="text-xs md:text-sm text-gray-400">
                  Curta posts e respostas interessantes para encontrá-los facilmente depois
                </p>
              </div>
            ) : (
              <>
                {/* Liked Posts Section */}
                {likedPosts.length > 0 && (
                  <div>
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                      <Heart size={14} className="md:w-4 md:h-4 text-red-500" />
                      Posts Curtidos ({likedPosts.length})
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      {likedPosts.map((post) => (
                        <Link 
                          key={post.id} 
                          href={`/community/${post.id}`}
                          className="block bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:border-primary transition-colors"
                        >
                          <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2 hover:text-primary line-clamp-2">
                            {post.title}
                          </h4>
                          
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                            <span>{post.author.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatDate(post.createdAt)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded hidden sm:inline-block">
                              {post.category}
                            </span>
                          </div>
                          
                          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Heart size={14} className="md:w-4 md:h-4 text-red-500 fill-red-500" />
                              <span>{post.likeCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <MessageSquare size={14} className="md:w-4 md:h-4" />
                              <span>{post.replyCount}</span>
                              <span className="hidden sm:inline"> respostas</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Liked Replies Section */}
                {likedReplies.length > 0 && (
                  <div>
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                      <MessageSquare size={14} className="md:w-4 md:h-4 text-primary" />
                      Respostas Curtidas ({likedReplies.length})
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      {likedReplies.map((reply) => (
                        <div key={reply.id} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                          <Link 
                            href={`/community/${reply.post.id}`}
                            className="flex items-center gap-2 text-xs md:text-sm text-primary hover:underline mb-2 md:mb-3"
                          >
                            <ExternalLink size={12} className="md:w-3.5 md:h-3.5 shrink-0" />
                            <span className="truncate">No post: {reply.post.title}</span>
                          </Link>
                          
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                            <span>{reply.author.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatDate(reply.createdAt)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded hidden sm:inline-block">
                              {reply.post.category}
                            </span>
                          </div>
                          
                          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                            {reply.content}
                          </p>
                          
                          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Heart size={14} className="md:w-4 md:h-4 text-red-500 fill-red-500" />
                              <span>{reply.likeCount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation - Horizontal scroll on mobile */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-brand-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 md:gap-2">
                <span className="truncate">{tab.label}</span>
                <span className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-brand-100 text-brand-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-6">
        {getTabContent()}
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={reportDialog.isOpen}
        onClose={handleReportClose}
        onSubmit={handleReportSubmit}
        itemType={reportDialog.itemType}
        itemAuthor={reportDialog.itemAuthor}
      />
    </div>
  );
}
