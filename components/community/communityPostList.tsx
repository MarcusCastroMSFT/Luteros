'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunityPost } from '@/types/community';
import { ReportDialog } from './reportDialog';
import { RepliesDialog } from './repliesDialog';
import { PostCard } from './postCard';

interface CommunityPostListProps {
  posts: CommunityPost[];
  selectedCategory?: string;
  onCreatePost: () => void;
}

export function CommunityPostList({ posts, selectedCategory, onCreatePost }: CommunityPostListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
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
  const [repliesDialog, setRepliesDialog] = useState<{
    isOpen: boolean;
    post: CommunityPost | null;
  }>({
    isOpen: false,
    post: null
  });

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

  // Filter and sort posts
  const getFilteredPosts = () => {
    let filteredPosts = posts;

    // Filter by search query
    if (searchQuery) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
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
      filteredPosts = filteredPosts.filter(post => post.category === categoryMap[selectedCategory]);
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.subcategory === selectedSubcategory);
    }

    // Sort posts
    if (sortBy === 'popular') {
      filteredPosts.sort((a, b) => b.likes - a.likes);
    } else {
      filteredPosts.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }

    return filteredPosts;
  };

  const filteredPosts = getFilteredPosts();

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
    
    console.log(`Reported ${reportDialog.itemType} ${reportDialog.itemId}:`, { reason, details });
    
    setReportDialog({ isOpen: false, itemId: '', itemType: 'post', itemAuthor: '' });
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {getCategoryTitle()}
          </h2>
          <Button onClick={onCreatePost} className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
            <Plus size={16} className="mr-2" />
            Criar novo post
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar na comunidade"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Subcategory Filter */}
            {subcategories.length > 0 && (
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
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
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  sortBy === 'popular'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Populares
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
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
      <div className="space-y-4">
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
      />
    </div>
  );
}
