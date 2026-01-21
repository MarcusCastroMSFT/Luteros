'use client';

import { useState, useEffect } from 'react';
import { CommunitySidebar } from '@/components/community/communitySidebar';
import { CommunityPostList } from '@/components/community/communityPostList';
import { UserProfileTabs } from '@/components/community/userProfileTabs';
import { CommunitySkeleton } from '@/components/community/communitySkeleton';
import { CommunityContentSkeleton } from '@/components/community/communityContentSkeleton';
import { CommunityPost, CommunityApiResponse } from '@/types/community';

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('pregnancy');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // On initial load, show full page skeleton
        // On category change, only show content skeleton
        if (isInitialLoading) {
          setIsInitialLoading(true);
        } else {
          setIsContentLoading(true);
        }
        setError(null);
        
        const categoryParam = selectedCategory === 'pregnancy' ? 'Gravidez' :
          selectedCategory === 'postpartum' ? 'Pós-parto' :
          selectedCategory === 'support' ? 'Suporte Contínuo' :
          selectedCategory === 'paternity' ? 'Paternidade' :
          selectedCategory === 'fertility' ? 'Fertilidade' :
          selectedCategory === 'menopause' ? 'Menopausa' : '';

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(categoryParam && { category: categoryParam })
        });

        const response = await fetch(`/api/community?${queryParams}`);
        const result: CommunityApiResponse = await response.json();

        if (response.ok && result.data) {
          setPosts(result.data);
        } else {
          setError('Erro ao carregar posts da comunidade');
        }
      } catch (err) {
        console.error('Error fetching community posts:', err);
        setError('Erro ao carregar posts da comunidade');
      } finally {
        setIsInitialLoading(false);
        setIsContentLoading(false);
      }
    }

    fetchPosts();
  }, [selectedCategory, page, isInitialLoading]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(0); // Reset to first page when category changes
    // Don't set isInitialLoading to true here - we want content-only loading
  };

  const handleCreatePost = () => {
    // TODO: Implement create post modal/form
    console.log('Create new post');
  };

  const isUserSection = selectedCategory?.includes('my-');
  
  // Filter posts for user sections
  const getUserPosts = () => {
    // In a real app, these would be filtered by actual user ID
    // For demo purposes, we'll return sample posts
    if (selectedCategory === 'my-posts') {
      return posts.slice(0, 2); // Sample user posts
    }
    return [];
  };

  // Show full page skeleton only on initial load
  if (isInitialLoading) {
    return <CommunitySkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar comunidade
          </div>
          <div className="text-gray-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          {/* Sidebar - 2 columns */}
          <div className="xl:col-span-2 mb-8 xl:mb-0">
            <div className="sticky top-8">
              <CommunitySidebar
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </div>

          {/* Main Content - 3 columns - Shows content skeleton when loading */}
          <div className="xl:col-span-3">
            {isContentLoading ? (
              <CommunityContentSkeleton />
            ) : isUserSection ? (
              <UserProfileTabs
                posts={getUserPosts()}
              />
            ) : (
              <CommunityPostList
                posts={posts}
                selectedCategory={selectedCategory}
                onCreatePost={handleCreatePost}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
