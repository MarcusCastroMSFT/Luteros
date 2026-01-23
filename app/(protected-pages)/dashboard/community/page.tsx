"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { CommunityStats } from "@/components/community/communityStats"
import { getCommunityColumns, type CommunityPostRow } from "@/components/community/community-columns"
import { RepliesDialog } from "@/components/community/repliesDialog"
import { useServerSideData } from "@/hooks/use-server-side-data"
import { toast } from "sonner"
import { CommunityPost, CommunityReply } from "@/types/community"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconLoader2, IconAlertTriangle } from "@tabler/icons-react"

export default function CommunityPage() {
  // Tab state for filtering
  const [activeTab, setActiveTab] = useState<'all' | 'reported'>('all')
  const [reportedCount, setReportedCount] = useState<number>(0)
  
  const {
    data: communityPosts,
    loading,
    error,
    totalCount,
    pageCount,
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    searchValue,
    setPagination,
    setSorting,
    setColumnFilters,
    setSearchValue,
    refetch,
  } = useServerSideData<CommunityPostRow>({
    endpoint: activeTab === 'reported' ? '/api/community?isReported=true' : '/api/community',
    initialPageSize: 10,
  })

  // Handle tab change with pagination reset
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'all' | 'reported')
    setPagination({ pageIndex: 0, pageSize })
  }, [setPagination, pageSize])

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [moderateOpen, setModerateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<CommunityPostRow | null>(null)
  const [selectedPostForView, setSelectedPostForView] = useState<CommunityPost | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Helper function to convert CommunityPostRow to CommunityPost for the dialog
  const convertToViewPost = useCallback((post: CommunityPostRow): CommunityPost => {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      category: post.category,
      subcategory: post.subcategory,
      status: post.status,
      replies: (post.replies || []) as CommunityReply[],
      repliesCount: post.repliesCount,
      likes: post.likes,
      isAnonymous: post.isAnonymous,
      createdDate: post.createdDate,
      lastReply: post.lastReply,
      tags: post.tags,
      isReported: post.isReported,
      hasReportedReplies: post.hasReportedReplies,
    }
  }, [])

  // Fetch reported posts count
  useEffect(() => {
    const fetchReportedCount = async () => {
      try {
        const response = await fetch('/api/community?isReported=true&pageSize=1')
        if (response.ok) {
          const data = await response.json()
          setReportedCount(data.totalCount || 0)
        }
      } catch (error) {
        console.error('Error fetching reported count:', error)
      }
    }
    fetchReportedCount()
  }, [refetch])

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    status: 'Ativo' as 'Ativo' | 'Fechado' | 'Moderação',
    isReported: false,
    isPinned: false,
  })

  // Action handlers
  const handleViewDetails = useCallback((post: CommunityPostRow) => {
    setSelectedPost(post)
    setSelectedPostForView(convertToViewPost(post))
    setDetailsOpen(true)
  }, [convertToViewPost])

  const handleEdit = useCallback((post: CommunityPostRow) => {
    setSelectedPost(post)
    setEditForm({
      title: post.title,
      content: post.content,
      status: post.status,
      isReported: post.isReported,
      isPinned: false, // Not in the row type, default to false
    })
    setEditOpen(true)
  }, [])

  const handleModerate = useCallback((post: CommunityPostRow) => {
    setSelectedPost(post)
    setEditForm({
      title: post.title,
      content: post.content,
      status: post.status,
      isReported: post.isReported,
      isPinned: false,
    })
    setModerateOpen(true)
  }, [])

  const handleDelete = useCallback((post: CommunityPostRow) => {
    setSelectedPost(post)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = async () => {
    if (!selectedPost) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/community/${selectedPost.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir post')
      }

      toast.success('Post excluído com sucesso')
      setDeleteOpen(false)
      refetch()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erro ao excluir post')
    } finally {
      setIsDeleting(false)
    }
  }

  const saveEdit = async () => {
    if (!selectedPost) return
    
    setIsSaving(true)
    try {
      const statusMap: Record<string, string> = {
        'Ativo': 'ACTIVE',
        'Fechado': 'CLOSED',
        'Moderação': 'MODERATION',
      }

      const response = await fetch(`/api/community/${selectedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content,
          status: statusMap[editForm.status],
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar post')
      }

      toast.success('Post atualizado com sucesso')
      setEditOpen(false)
      refetch()
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Erro ao atualizar post')
    } finally {
      setIsSaving(false)
    }
  }

  const saveModeration = async () => {
    if (!selectedPost) return
    
    setIsSaving(true)
    try {
      const statusMap: Record<string, string> = {
        'Ativo': 'ACTIVE',
        'Fechado': 'CLOSED',
        'Moderação': 'MODERATION',
      }

      const response = await fetch(`/api/community/${selectedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusMap[editForm.status],
          isReported: editForm.isReported,
          isPinned: editForm.isPinned,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao moderar post')
      }

      toast.success('Moderação aplicada com sucesso')
      setModerateOpen(false)
      refetch()
    } catch (error) {
      console.error('Moderation error:', error)
      toast.error('Erro ao moderar post')
    } finally {
      setIsSaving(false)
    }
  }

  // Memoize columns with handlers
  const columns = useMemo(
    () => getCommunityColumns({
      onViewDetails: handleViewDetails,
      onEdit: handleEdit,
      onModerate: handleModerate,
      onDelete: handleDelete,
    }),
    [handleViewDetails, handleEdit, handleModerate, handleDelete]
  )

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Comunidade</h1>
                <p className="text-muted-foreground">
                  Gerencie posts, respostas e engajamento da comunidade.
                </p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <div className="text-red-600">
                Erro ao carregar posts da comunidade: {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Comunidade</h1>
              <p className="text-muted-foreground">
                Gerencie posts, respostas e engajamento da comunidade.
                {!loading && (
                  <span className="ml-2 text-sm">
                    ({totalCount.toLocaleString()} posts totais)
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <CommunityStats />
          
          {/* Tabs for filtering */}
          <div className="px-4 lg:px-6 mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all" className="cursor-pointer">
                  Todos os Posts
                </TabsTrigger>
                <TabsTrigger value="reported" className="cursor-pointer">
                  <IconAlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  Denunciados
                  {reportedCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {reportedCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Community Table */}
          <ServerSideDataTable
            columns={columns}
            data={communityPosts}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="title"
            searchPlaceholder="Buscar por título, conteúdo, autor ou tags..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            manualPagination={true}
            manualSorting={true}
            manualFiltering={true}
          />
        </div>
      </div>

      {/* View Details Dialog - Reusing RepliesDialog from public page */}
      <RepliesDialog
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        post={selectedPostForView}
        isAdmin={true}
        onReplyAdded={(postId, reply) => {
          // Update the local post data when a reply is added
          if (selectedPostForView) {
            setSelectedPostForView({
              ...selectedPostForView,
              replies: [...selectedPostForView.replies, reply],
              repliesCount: selectedPostForView.repliesCount + 1,
            })
          }
          // Refetch to update the table
          refetch()
        }}
        onReplyDeleted={(postId, replyId) => {
          // Update the local post data when a reply is deleted
          if (selectedPostForView) {
            setSelectedPostForView({
              ...selectedPostForView,
              replies: selectedPostForView.replies.filter(r => r.id !== replyId),
              repliesCount: Math.max(0, selectedPostForView.repliesCount - 1),
            })
          }
          // Refetch to update the table
          refetch()
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
            <DialogDescription>
              Faça alterações no conteúdo do post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Conteúdo</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={8}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveEdit} disabled={isSaving} className="cursor-pointer">
                {isSaving && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Moderate Dialog */}
      <Dialog open={moderateOpen} onOpenChange={setModerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Moderar Post</DialogTitle>
            <DialogDescription>
              Altere o status e configurações de moderação do post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: 'Ativo' | 'Fechado' | 'Moderação') => 
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Moderação">Moderação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isReported}
                  onChange={(e) => setEditForm({ ...editForm, isReported: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Marcar como denunciado</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isPinned}
                  onChange={(e) => setEditForm({ ...editForm, isPinned: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Fixar no topo</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setModerateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveModeration} disabled={isSaving} className="cursor-pointer">
                {isSaving && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post &quot;{selectedPost?.title}&quot; e todas as suas respostas serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
