'use client';

import { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Flag } from 'lucide-react';
import { CommunityPost } from '@/types/community';
import { ReportDialog } from './reportDialog';

interface UserProfileTabsProps {
  posts: CommunityPost[];
}

export function UserProfileTabs({ posts }: UserProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'bookmarks'>('posts');
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

  const tabs = [
    { id: 'posts' as const, label: 'Meus Posts', count: posts.length },
    { id: 'replies' as const, label: 'Minhas Respostas', count: 0 }, // Would come from replies data
    { id: 'bookmarks' as const, label: 'Meus Favoritos', count: 0 } // Would come from bookmarks data
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
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  Você ainda não criou nenhum post
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Comece a participar da comunidade criando seu primeiro post
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary">
                      {post.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span>{formatDate(post.createdDate)}</span>
                    <span>•</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {post.subcategory}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Heart size={16} />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      <span>{post.repliesCount} respostas</span>
                    </div>
                    <button 
                      onClick={() => reportItem(post.id, post.author)}
                      className={`flex items-center gap-2 transition-colors cursor-pointer ${
                        reportedItems.has(post.id) 
                          ? 'text-red-500 dark:text-red-400' 
                          : 'hover:text-red-500 dark:hover:text-red-400'
                      }`}
                      disabled={reportedItems.has(post.id)}
                    >
                      <Flag size={16} />
                      <span>{reportedItems.has(post.id) ? 'Reportado' : 'Reportar'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      
      case 'replies':
        return (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Suas respostas aparecerão aqui
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Participe das discussões respondendo aos posts da comunidade
            </p>
          </div>
        );
      
      case 'bookmarks':
        return (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Seus posts favoritos aparecerão aqui
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Salve posts interessantes para acessá-los facilmente depois
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-orange-50 dark:bg-orange-900/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
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
