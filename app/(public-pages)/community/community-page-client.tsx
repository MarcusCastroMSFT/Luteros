'use client'

import { useState, useEffect, useCallback } from 'react'
import { Filter, MessageSquare, Reply, Bookmark, X } from 'lucide-react'
import { CommunitySidebar } from '@/components/community/communitySidebar'
import { CommunityPostList } from '@/components/community/communityPostList'
import { UserProfileTabs } from '@/components/community/userProfileTabs'
import { CommunityContentSkeleton } from '@/components/community/communityContentSkeleton'
import { CommunityPost, CommunityPagination, CommunityApiResponse } from '@/types/community'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Quick access tabs for mobile - "My Community" section
  const quickAccessTabs = [
    { id: 'my-posts', label: 'Meus Posts', icon: MessageSquare },
    { id: 'my-replies', label: 'Respostas', icon: Reply },
    { id: 'my-bookmarks', label: 'Favoritos', icon: Bookmark },
  ]

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
    setIsMobileSidebarOpen(false) // Close mobile sidebar when category selected
  }

  // Get category display name for mobile filter button
  const getCategoryDisplayName = () => {
    const categoryNames: Record<string, string> = {
      'pregnancy': 'Gravidez',
      'postpartum': 'Pós-parto',
      'general-health': 'Saúde Geral',
      'parenting-pediatrics': 'Paternidade',
      'ttc-fertility': 'TTC e Fertilidade',
      'fertility-treatment': 'Tratamento',
      'adoption-surrogacy': 'Adoção',
      'menopause': 'Menopausa',
      'birth-month-groups': 'Grupos',
      'ask-provider': 'Especialista',
      'my-posts': 'Meus Posts',
      'my-replies': 'Minhas Respostas',
      'my-bookmarks': 'Meus Favoritos'
    }
    return categoryNames[selectedCategory] || 'Categoria'
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
      <div className="max-w-[1428px] mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-8">
        
        {/* Mobile Quick Access Bar - Only visible on mobile */}
        <div className="xl:hidden mb-4">
          {/* Quick Access Tabs - Horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {quickAccessTabs.map((tab) => {
              const Icon = tab.icon
              const isSelected = selectedCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleCategorySelect(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
            
            {/* Category Filter Button */}
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
              <SheetTrigger asChild>
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    !selectedCategory?.includes('my-')
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={16} />
                  {!selectedCategory?.includes('my-') ? getCategoryDisplayName() : 'Categorias'}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="text-left">Categorias</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(100%-60px)] pt-4">
                  <CommunitySidebar
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    isMobile={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          {/* Sidebar - Hidden on mobile, visible on xl */}
          <div className="hidden xl:block xl:col-span-2">
            <div className="sticky top-8">
              <CommunitySidebar
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </div>

          {/* Main Content - Full width on mobile */}
          <div className="xl:col-span-3">
            {isContentLoading ? (
              <CommunityContentSkeleton />
            ) : isUserSection ? (
              <UserProfileTabs
                posts={getUserPosts()}
                initialTab={selectedCategory === 'my-replies' ? 'replies' : selectedCategory === 'my-favorites' ? 'bookmarks' : 'posts'}
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
