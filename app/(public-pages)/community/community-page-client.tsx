'use client'

import { useState, useEffect, useCallback } from 'react'
import { CommunitySidebar } from '@/components/community/communitySidebar'
import { CommunityPostList } from '@/components/community/communityPostList'
import { UserProfileTabs } from '@/components/community/userProfileTabs'
import { CommunityContentSkeleton } from '@/components/community/communityContentSkeleton'
import { CommunityPost, CommunityPagination, CommunityApiResponse } from '@/types/community'

interface CommunityPageClientProps {
  initialPosts: CommunityPost[]
  initialPagination: CommunityPagination
  initialCategories: string[]
}

export function CommunityPageClient({ 
  initialPosts, 
  initialPagination,
  initialCategories 
}: CommunityPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('pregnancy')
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts)
  const [pagination, setPagination] = useState<CommunityPagination>(initialPagination)
  const [categories] = useState<string[]>(initialCategories)
  const [isContentLoading, setIsContentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const fetchPosts = useCallback(async (categorySlug: string, pageNum: number) => {
    try {
      setIsContentLoading(true)
      setError(null)
      
      const categoryParam = categorySlug === 'pregnancy' ? 'Gravidez' :
        categorySlug === 'postpartum' ? 'Pós-parto' :
        categorySlug === 'support' ? 'Suporte Contínuo' :
        categorySlug === 'paternity' ? 'Paternidade' :
        categorySlug === 'fertility' ? 'Fertilidade' :
        categorySlug === 'menopause' ? 'Menopausa' : ''

      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(categoryParam && { category: categoryParam })
      })

      const response = await fetch(`/api/community?${queryParams}`)
      const result: CommunityApiResponse = await response.json()

      if (response.ok && result.data) {
        setPosts(result.data)
        setPagination(result.pagination)
      } else {
        setError('Erro ao carregar posts da comunidade')
      }
    } catch (err) {
      console.error('Error fetching community posts:', err)
      setError('Erro ao carregar posts da comunidade')
    } finally {
      setIsContentLoading(false)
    }
  }, [])

  useEffect(() => {
    // Skip fetch on initial render - we already have SSR data
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }
    
    // Skip fetch for user sections (my-posts, my-activity)
    if (selectedCategory?.includes('my-')) {
      return
    }

    fetchPosts(selectedCategory, page)
  }, [selectedCategory, page, fetchPosts, isInitialLoad])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setPage(0) // Reset to first page when category changes
  }

  const isUserSection = selectedCategory?.includes('my-')
  
  // Filter posts for user sections
  const getUserPosts = () => {
    // In a real app, these would be filtered by actual user ID
    // For demo purposes, we'll return sample posts
    if (selectedCategory === 'my-posts') {
      return posts.slice(0, 2)
    }
    return []
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
    )
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
