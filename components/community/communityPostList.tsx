'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CommunityPost, CommunityReply } from '@/types/community';
import { ReportDialog } from './reportDialog';
import { RepliesDialog } from './repliesDialog';
import { CreatePostDialog } from './createPostDialog';
import { PostCard } from './postCard';
import { useDebounce } from '@/hooks/use-debounce';

interface CommunityPostListProps {
  posts: CommunityPost[];
  selectedCategory?: string;
  onCreatePost?: () => void;
  onPostCreated?: (post: CommunityPost) => void;
}

export function CommunityPostList({ posts: initialPosts, selectedCategory, onPostCreated }: CommunityPostListProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [reportedItems, setReportedItems] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [createPostDialog, setCreatePostDialog] = useState(false);
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
  const [repliesDialog, setRepliesDialog] = useState<{
    isOpen: boolean;
    post: CommunityPost | null;
  }>({
    isOpen: false,
    post: null
  });

  // Update posts when initialPosts change
  useState(() => {
    setPosts(initialPosts);
  });

  // Fetch user's liked posts on mount
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await fetch('/api/community/liked');
        if (response.ok) {
          const data = await response.json();
          if (data.likedPostIds && Array.isArray(data.likedPostIds)) {
            setLikedPosts(new Set(data.likedPostIds));
          }
        }
      } catch (error) {
        console.error('Failed to fetch liked posts:', error);
      }
    };
    
    fetchLikedPosts();
  }, []);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get unique subcategories for the selected category
  const getSubcategories = () => {
    if (!selectedCategory || selectedCategory.includes('my-')) return [];
    
    const categoryPosts = posts.filter(post => {
      const categoryMap: Record<string, string> = {
        'pregnancy': 'Gravidez',
        'postpartum': 'Pós-parto',
        'general-health': 'Suporte Contínuo',
        'parenting-pediatrics': 'Paternidade',
        'ttc-fertility': 'Fertilidade',
        'fertility-treatment': 'Fertilidade',
        'adoption-surrogacy': 'Fertilidade',
        'menopause': 'Menopausa'
      };
      return post.category === categoryMap[selectedCategory];
    });
    
    const subcategories = [...new Set(categoryPosts.map(post => post.subcategory))];
    return subcategories;
  };

  // Calculate subcategories for the current category
  const subcategories = getSubcategories();

  // Filter and sort posts with memoization for performance
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by search query (using debounced value)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory && !selectedCategory.includes('my-')) {
      const categoryMap: Record<string, string> = {
        'pregnancy': 'Gravidez',
        'postpartum': 'Pós-parto',
        'general-health': 'Suporte Contínuo',
        'parenting-pediatrics': 'Paternidade',
        'ttc-fertility': 'Fertilidade',
        'fertility-treatment': 'Fertilidade',
        'adoption-surrogacy': 'Fertilidade',
        'menopause': 'Menopausa'
      };
      result = result.filter(post => post.category === categoryMap[selectedCategory]);
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      result = result.filter(post => post.subcategory === selectedSubcategory);
    }

    // Sort posts (create a new array to avoid mutating the original)
    if (sortBy === 'popular') {
      result.sort((a, b) => b.likes - a.likes);
    } else {
      result.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }

    return result;
  }, [posts, debouncedSearchQuery, selectedCategory, selectedSubcategory, sortBy]);

  const reportItem = (itemId: string, author: string) => {
    if (reportedItems.has(itemId)) return;
    
    setReportDialog({
      isOpen: true,
      itemId,
      itemType: 'post',
      itemAuthor: author
    });
  };

  const handleReportSubmit = async (reason: string, details: string) => {
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
      setReportDialog({ isOpen: false, itemId: '', itemType: 'post', itemAuthor: '' });
    }
  };

  const handleReportClose = () => {
    setReportDialog({ isOpen: false, itemId: '', itemType: 'post', itemAuthor: '' });
  };

  const openRepliesDialog = (post: CommunityPost) => {
    setRepliesDialog({ isOpen: true, post });
  };

  const closeRepliesDialog = () => {
    setRepliesDialog({ isOpen: false, post: null });
  };

  const handlePostCreated = (newPost: CommunityPost) => {
    // Add new post to the top of the list
    setPosts(prev => [newPost, ...prev]);
    if (onPostCreated) {
      onPostCreated(newPost);
    }
  };

  const handleReplyAdded = (postId: string, reply: CommunityReply) => {
    // Update the reply count for the post
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, repliesCount: post.repliesCount + 1, replies: [...post.replies, reply] }
        : post
    ));
    
    // Also update the dialog's post reference
    if (repliesDialog.post && repliesDialog.post.id === postId) {
      setRepliesDialog(prev => ({
        ...prev,
        post: prev.post ? { ...prev.post, repliesCount: prev.post.repliesCount + 1 } : null
      }));
    }
  };

  const handlePostLikedFromDialog = (postId: string, liked: boolean, likeCount: number) => {
    // Update the like count for the post in the list
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: likeCount }
        : post
    ));
    
    // Update the liked posts set
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (liked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  const handlePostLikedFromCard = (postId: string, liked: boolean, likeCount: number) => {
    // Update the like count for the post in the list
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: likeCount }
        : post
    ));
    
    // Update the liked posts set
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (liked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  const getCategoryTitle = () => {
    const categoryTitles: Record<string, string> = {
      'pregnancy': 'Gravidez',
      'postpartum': 'Pós-parto',
      'general-health': 'Saúde Geral',
      'parenting-pediatrics': 'Paternidade e Pediatria',
      'ttc-fertility': 'TTC e Fertilidade',
      'fertility-treatment': 'Tratamento de Fertilidade',
      'adoption-surrogacy': 'Adoção e Barriga de Aluguel',
      'menopause': 'Menopausa',
      'my-posts': 'Meus Posts',
      'my-replies': 'Minhas Respostas',
      'my-bookmarks': 'Meus Favoritos'
    };
    return categoryTitles[selectedCategory || 'pregnancy'] || 'Comunidade';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
            {getCategoryTitle()}
          </h2>
          <Button onClick={() => setCreatePostDialog(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shrink-0" size="sm">
            <Plus size={16} className="md:mr-2" />
            <span className="hidden md:inline">Criar novo post</span>
            <span className="md:hidden">Novo</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 md:space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar na comunidade"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filters - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Subcategory Filter */}
            {subcategories.length > 0 && (
              <div className="flex-1 min-w-0">
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Todas as subcategorias</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Filter */}
            <div className="flex bg-gray-100 rounded-lg p-1 self-start">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  sortBy === 'popular'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Populares
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  sortBy === 'recent'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recentes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3 md:space-y-4 p-2 md:p-0">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-500 mb-2">
              Nenhum post encontrado
            </div>
            <p className="text-sm text-gray-400">
              Tente ajustar os filtros ou criar um novo post
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onViewReplies={openRepliesDialog}
              onReport={reportItem}
              isReported={reportedItems.has(post.id)}
              isLiked={likedPosts.has(post.id)}
              onLikeChanged={handlePostLikedFromCard}
            />
          ))
        )}
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={reportDialog.isOpen}
        onClose={handleReportClose}
        onSubmit={handleReportSubmit}
        itemType={reportDialog.itemType}
        itemAuthor={reportDialog.itemAuthor}
      />

      {/* Replies Dialog */}
      <RepliesDialog
        isOpen={repliesDialog.isOpen}
        onClose={closeRepliesDialog}
        post={repliesDialog.post}
        onReplyAdded={handleReplyAdded}
        onPostLiked={handlePostLikedFromDialog}
        isPostLikedInitial={repliesDialog.post ? likedPosts.has(repliesDialog.post.id) : false}
      />

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={createPostDialog}
        onClose={() => setCreatePostDialog(false)}
        onPostCreated={handlePostCreated}
        selectedCategory={getCategoryTitle()}
      />
    </div>
  );
}
