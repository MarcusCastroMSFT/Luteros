'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dynamic import for RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import('@/components/editor').then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-64 bg-muted animate-pulse rounded-md" /> }
);
import { 
  IconPlus, 
  IconGripVertical,
  IconPencil,
  IconTrash,
  IconLoader2,
  IconVideo,
  IconPlayerPlay,
  IconEye,
  IconEyeOff,
  IconLock,
  IconLockOpen,
  IconChevronDown,
  IconChevronRight,
  IconFolder,
  IconFolderPlus,
  IconDotsVertical,
  IconArticle,
  IconHeadphones,
  IconBrandYoutube,
  IconUpload,
  IconLink,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'audio';
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  videoProvider: string | null;
  duration: number | null;
  order: number;
  sectionTitle: string | null;
  isPublished: boolean;
  isFree: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Section {
  title: string | null;
  lessons: Lesson[];
}

interface LessonFormData {
  title: string;
  type: 'video' | 'article' | 'audio';
  description: string;
  content: string;
  videoUrl: string;
  videoProvider: string;
  duration: string;
  sectionTitle: string;
  isPublished: boolean;
  isFree: boolean;
}

const emptyFormData: LessonFormData = {
  title: '',
  type: 'video',
  description: '',
  content: '',
  videoUrl: '',
  videoProvider: 'youtube',
  duration: '',
  sectionTitle: '',
  isPublished: false,
  isFree: false,
};

interface LessonsPanelProps {
  courseId: string;
}

export function LessonsPanel({ courseId }: LessonsPanelProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<LessonFormData>(emptyFormData);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [draggedLesson, setDraggedLesson] = useState<Lesson | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false);
  const [emptySections, setEmptySections] = useState<string[]>([]);

  // Group lessons by section
  const sections = useMemo(() => {
    const sectionMap = new Map<string | null, Lesson[]>();
    
    // Sort lessons by order first
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    
    // Group by section, maintaining order
    sortedLessons.forEach(lesson => {
      const key = lesson.sectionTitle;
      if (!sectionMap.has(key)) {
        sectionMap.set(key, []);
      }
      sectionMap.get(key)!.push(lesson);
    });

    // Convert to array, with null section first if it exists
    const result: Section[] = [];
    
    // Add unsectioned lessons first
    if (sectionMap.has(null)) {
      result.push({ title: null, lessons: sectionMap.get(null)! });
      sectionMap.delete(null);
    }
    
    // Add sectioned lessons
    sectionMap.forEach((sectionLessons, title) => {
      result.push({ title, lessons: sectionLessons });
    });

    // Add empty sections (sections without lessons)
    emptySections.forEach(sectionName => {
      if (!sectionMap.has(sectionName)) {
        result.push({ title: sectionName, lessons: [] });
      }
    });

    return result;
  }, [lessons, emptySections]);

  // Get unique section names for dropdown
  const existingSections = useMemo(() => {
    const sectionNames = new Set<string>();
    lessons.forEach(lesson => {
      if (lesson.sectionTitle) {
        sectionNames.add(lesson.sectionTitle);
      }
    });
    // Also include empty sections
    emptySections.forEach(name => sectionNames.add(name));
    return Array.from(sectionNames).sort();
  }, [lessons, emptySections]);

  // Fetch lessons
  const fetchLessons = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        credentials: 'include',
      });
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to fetch lessons:', result);
        throw new Error(result.error || 'Failed to fetch lessons');
      }
      
      if (result.success) {
        setLessons(result.data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Erro ao carregar aulas');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Toggle section collapse
  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  // Open dialog for new lesson
  const handleNewLesson = (sectionTitle?: string | null) => {
    setEditingLesson(null);
    setIsCreatingNewSection(false);
    setFormData({
      ...emptyFormData,
      sectionTitle: sectionTitle || '',
    });
    setDialogOpen(true);
  };

  // Open dialog to edit lesson
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsCreatingNewSection(false);
    setFormData({
      title: lesson.title,
      type: lesson.type || 'video',
      description: lesson.description || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      videoProvider: lesson.videoProvider || 'youtube',
      duration: lesson.duration?.toString() || '',
      sectionTitle: lesson.sectionTitle || '',
      isPublished: lesson.isPublished,
      isFree: lesson.isFree,
    });
    setDialogOpen(true);
  };

  // Create new section
  const handleCreateSection = () => {
    setNewSectionName('');
    setEditingSectionName(null);
    setSectionDialogOpen(true);
  };

  // Rename section
  const handleRenameSection = (currentName: string) => {
    setNewSectionName(currentName);
    setEditingSectionName(currentName);
    setSectionDialogOpen(true);
  };

  // Save section (create or rename)
  const handleSaveSection = async () => {
    if (!newSectionName.trim()) {
      toast.error('Nome da seção é obrigatório');
      return;
    }

    if (editingSectionName) {
      // Rename section - update all lessons in this section
      setSaving(true);
      try {
        const lessonsToUpdate = lessons.filter(l => l.sectionTitle === editingSectionName);
        
        await Promise.all(
          lessonsToUpdate.map(lesson =>
            fetch(`/api/courses/${courseId}/lessons/${lesson.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sectionTitle: newSectionName.trim() }),
            })
          )
        );

        toast.success('Seção renomeada!');
        setSectionDialogOpen(false);
        fetchLessons();
      } catch (error) {
        console.error('Error renaming section:', error);
        toast.error('Erro ao renomear seção');
      } finally {
        setSaving(false);
      }
    } else {
      // Create a new empty section
      const trimmedName = newSectionName.trim();
      if (existingSections.includes(trimmedName)) {
        toast.error('Já existe uma seção com esse nome');
        return;
      }
      setEmptySections(prev => [...prev, trimmedName]);
      toast.success('Seção criada!');
      setSectionDialogOpen(false);
    }
  };

  // Delete section (move lessons to unsectioned)
  const handleDeleteSection = async (sectionTitle: string) => {
    // Check if it's an empty section (no lessons)
    const lessonsInSection = lessons.filter(l => l.sectionTitle === sectionTitle);
    
    if (lessonsInSection.length === 0) {
      // Just remove from emptySections state
      setEmptySections(prev => prev.filter(s => s !== sectionTitle));
      toast.success('Seção removida!');
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        lessonsInSection.map(lesson =>
          fetch(`/api/courses/${courseId}/lessons/${lesson.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sectionTitle: null }),
          })
        )
      );

      // Also remove from emptySections if it was there
      setEmptySections(prev => prev.filter(s => s !== sectionTitle));
      toast.success('Seção removida (aulas mantidas)');
      fetchLessons();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Erro ao remover seção');
    } finally {
      setSaving(false);
    }
  };

  // Save lesson (create or update)
  const handleSaveLesson = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const url = editingLesson
        ? `/api/courses/${courseId}/lessons/${editingLesson.id}`
        : `/api/courses/${courseId}/lessons`;
      
      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          type: formData.type,
          description: formData.description.trim() || null,
          content: formData.type === 'article' ? formData.content : null,
          videoUrl: formData.type === 'video' ? (formData.videoUrl.trim() || null) : null,
          videoProvider: formData.type === 'video' ? formData.videoProvider : null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          sectionTitle: formData.sectionTitle.trim() || null,
          isPublished: formData.isPublished,
          isFree: formData.isFree,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save lesson');
      }

      // Remove from empty sections if this lesson was added to one
      const sectionName = formData.sectionTitle.trim();
      if (sectionName && emptySections.includes(sectionName)) {
        setEmptySections(prev => prev.filter(s => s !== sectionName));
      }

      toast.success(editingLesson ? 'Aula atualizada!' : 'Aula criada!');
      setDialogOpen(false);
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(editingLesson ? 'Erro ao atualizar aula' : 'Erro ao criar aula');
    } finally {
      setSaving(false);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/lessons/${lessonToDelete.id}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete lesson');
      }

      toast.success('Aula excluída!');
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Erro ao excluir aula');
    } finally {
      setSaving(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (lesson: Lesson) => {
    setDraggedLesson(lesson);
  };

  const handleDragOver = (e: React.DragEvent, lessonId: string) => {
    e.preventDefault();
    setDragOverLessonId(lessonId);
  };

  const handleDragEnd = async () => {
    if (!draggedLesson || !dragOverLessonId || draggedLesson.id === dragOverLessonId) {
      setDraggedLesson(null);
      setDragOverLessonId(null);
      return;
    }

    const draggedIndex = lessons.findIndex(l => l.id === draggedLesson.id);
    const targetIndex = lessons.findIndex(l => l.id === dragOverLessonId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedLesson(null);
      setDragOverLessonId(null);
      return;
    }

    const newLessons = [...lessons];
    const [removed] = newLessons.splice(draggedIndex, 1);
    
    // Also update section if dropping into a different section
    const targetLesson = lessons.find(l => l.id === dragOverLessonId);
    if (targetLesson && targetLesson.sectionTitle !== removed.sectionTitle) {
      removed.sectionTitle = targetLesson.sectionTitle;
    }
    
    newLessons.splice(targetIndex, 0, removed);

    // Update the order property for each lesson to match new positions
    const reorderedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order: index,
    }));

    setLessons(reorderedLessons);
    setDraggedLesson(null);
    setDragOverLessonId(null);

    // Save new order to server
    try {
      const lessonIdsToReorder = reorderedLessons.map(l => l.id);
      console.log('Reordering lessons:', lessonIdsToReorder);
      
      const response = await fetch(`/api/courses/${courseId}/lessons/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonIds: lessonIdsToReorder,
        }),
      });

      const result = await response.json();
      console.log('Reorder response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to reorder lessons');
      }

      // Update lessons with server response to ensure consistency
      if (result.data) {
        setLessons(result.data);
      }

      // Also update section if changed
      if (targetLesson && targetLesson.sectionTitle !== draggedLesson.sectionTitle) {
        await fetch(`/api/courses/${courseId}/lessons/${draggedLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionTitle: targetLesson.sectionTitle }),
        });
      }

      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Error reordering lessons:', error);
      toast.error('Erro ao reordenar aulas');
      fetchLessons();
    }
  };

  // Quick toggle published status
  const handleTogglePublished = async (lesson: Lesson) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/lessons/${lesson.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: !lesson.isPublished }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update lesson');
      }

      setLessons(prev => 
        prev.map(l => 
          l.id === lesson.id ? { ...l, isPublished: !l.isPublished } : l
        )
      );
      toast.success(lesson.isPublished ? 'Aula ocultada' : 'Aula publicada');
    } catch (error) {
      console.error('Error toggling lesson:', error);
      toast.error('Erro ao atualizar aula');
    }
  };

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}min ${secs > 0 ? `${secs}s` : ''}` : `${secs}s`;
  };

  // Get lesson type icon
  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <IconVideo className="h-3 w-3 text-blue-500" />;
      case 'article':
        return <IconArticle className="h-3 w-3 text-orange-500" />;
      case 'audio':
        return <IconHeadphones className="h-3 w-3 text-purple-500" />;
      default:
        return <IconVideo className="h-3 w-3 text-muted-foreground" />;
    }
  };

  // Render a single lesson item
  const renderLesson = (lesson: Lesson, globalIndex: number) => (
    <div
      key={lesson.id}
      draggable
      onDragStart={() => handleDragStart(lesson)}
      onDragOver={(e) => handleDragOver(e, lesson.id)}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative flex items-start gap-2 p-2 rounded-md border bg-card transition-all",
        "hover:shadow-sm hover:border-primary/20",
        draggedLesson?.id === lesson.id && "opacity-50",
        dragOverLessonId === lesson.id && draggedLesson?.id !== lesson.id && "border-primary border-dashed"
      )}
    >
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground mt-0.5 flex-shrink-0">
        <IconGripVertical className="h-4 w-4" />
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-muted-foreground">
            #{globalIndex + 1}
          </span>
          {getLessonTypeIcon(lesson.type)}
          {lesson.duration && (
            <span className="text-xs text-muted-foreground">
              {formatDuration(lesson.duration)}
            </span>
          )}
        </div>
        <h4 className="font-medium text-sm leading-tight line-clamp-1">
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            "text-xs",
            lesson.isFree ? "text-green-600" : "text-muted-foreground"
          )}>
            {lesson.isFree ? (
              <span className="flex items-center gap-0.5">
                <IconLockOpen className="h-3 w-3" />
                Grátis
              </span>
            ) : (
              <span className="flex items-center gap-0.5">
                <IconLock className="h-3 w-3" />
              </span>
            )}
          </span>
          <span className={cn(
            "text-xs",
            lesson.isPublished ? "text-green-600" : "text-muted-foreground"
          )}>
            {lesson.isPublished ? (
              <IconEye className="h-3 w-3" />
            ) : (
              <IconEyeOff className="h-3 w-3" />
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-pointer"
          onClick={() => handleTogglePublished(lesson)}
          title={lesson.isPublished ? 'Ocultar aula' : 'Publicar aula'}
        >
          {lesson.isPublished ? (
            <IconEyeOff className="h-3.5 w-3.5" />
          ) : (
            <IconEye className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-pointer"
          onClick={() => handleEditLesson(lesson)}
        >
          <IconPencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive cursor-pointer"
          onClick={() => {
            setLessonToDelete(lesson);
            setDeleteDialogOpen(true);
          }}
        >
          <IconTrash className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  let globalLessonIndex = 0;

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Aulas</CardTitle>
              <CardDescription>
                {lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'} • {sections.filter(s => s.title).length} {sections.filter(s => s.title).length === 1 ? 'seção' : 'seções'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={handleCreateSection} className="cursor-pointer" title="Nova Seção">
                <IconFolderPlus className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => handleNewLesson()} className="cursor-pointer">
                <IconPlus className="h-4 w-4 mr-1" />
                Aula
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <IconVideo className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Nenhuma aula adicionada ainda
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCreateSection} className="cursor-pointer">
                  <IconFolderPlus className="h-4 w-4 mr-1" />
                  Criar Seção
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleNewLesson()} className="cursor-pointer">
                  <IconPlus className="h-4 w-4 mr-1" />
                  Adicionar Aula
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-3">
                {sections.map((section) => {
                  const sectionKey = section.title || '__unsectioned__';
                  const isCollapsed = collapsedSections.has(sectionKey);

                  if (section.title === null) {
                    // Unsectioned lessons
                    return (
                      <div key="unsectioned" className="space-y-1.5">
                        {section.lessons.map(lesson => {
                          const index = globalLessonIndex++;
                          return renderLesson(lesson, index);
                        })}
                      </div>
                    );
                  }

                  // Sectioned lessons
                  return (
                    <Collapsible
                      key={section.title}
                      open={!isCollapsed}
                      onOpenChange={() => toggleSection(sectionKey)}
                    >
                      <div className="rounded-lg border bg-muted/30">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 rounded-t-lg">
                            <div className="flex items-center gap-2">
                              {isCollapsed ? (
                                <IconChevronRight className="h-4 w-4" />
                              ) : (
                                <IconChevronDown className="h-4 w-4" />
                              )}
                              <IconFolder className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{section.title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {section.lessons.length}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDotsVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNewLesson(section.title);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <IconPlus className="h-4 w-4 mr-2" />
                                  Adicionar Aula
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameSection(section.title!);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <IconPencil className="h-4 w-4 mr-2" />
                                  Renomear Seção
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.title!);
                                  }}
                                  className="text-destructive cursor-pointer"
                                >
                                  <IconTrash className="h-4 w-4 mr-2" />
                                  Remover Seção
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-2 pt-0 space-y-1.5">
                            {section.lessons.map(lesson => {
                              const index = globalLessonIndex++;
                              return renderLesson(lesson, index);
                            })}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSectionName ? 'Renomear Seção' : 'Nova Seção'}
            </DialogTitle>
            <DialogDescription>
              {editingSectionName 
                ? 'Digite o novo nome da seção'
                : 'Crie uma nova seção para organizar suas aulas'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-name">Nome da Seção</Label>
              <Input
                id="section-name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Ex: Módulo 1 - Introdução"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSectionDialogOpen(false)}
              disabled={saving}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveSection} 
              disabled={saving || !newSectionName.trim()}
              className="cursor-pointer"
            >
              {saving ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingSectionName ? 'Salvar' : 'Criar Seção'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Lesson Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          formData.type === 'article' ? "max-w-4xl" : "max-w-2xl"
        )}>
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Aula' : 'Nova Aula'}
            </DialogTitle>
            <DialogDescription>
              {editingLesson 
                ? 'Atualize as informações da aula'
                : 'Preencha as informações da nova aula'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Lesson Type Selection */}
            <div className="space-y-2">
              <Label>Tipo de Aula</Label>
              <Tabs
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  type: value as 'video' | 'article' | 'audio' 
                }))}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="video" className="flex items-center gap-2 cursor-pointer">
                    <IconVideo className="h-4 w-4" />
                    Vídeo
                  </TabsTrigger>
                  <TabsTrigger value="article" className="flex items-center gap-2 cursor-pointer">
                    <IconArticle className="h-4 w-4" />
                    Artigo
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-2 cursor-pointer">
                    <IconHeadphones className="h-4 w-4" />
                    Áudio
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="lesson-title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lesson-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Introdução ao tema"
              />
            </div>

            {/* Section Title */}
            <div className="space-y-2">
              <Label htmlFor="lesson-section">Seção/Módulo</Label>
              {isCreatingNewSection ? (
                <div className="flex gap-2">
                  <Input
                    value={formData.sectionTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, sectionTitle: e.target.value }))}
                    placeholder="Digite o nome da nova seção"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsCreatingNewSection(false);
                      setFormData(prev => ({ ...prev, sectionTitle: '' }));
                    }}
                    className="cursor-pointer flex-shrink-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.sectionTitle || '__none__'}
                  onValueChange={(value) => {
                    if (value === '__new__') {
                      setIsCreatingNewSection(true);
                      setFormData(prev => ({ ...prev, sectionTitle: '' }));
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        sectionTitle: value === '__none__' ? '' : value 
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma seção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem seção</SelectItem>
                    {existingSections.map(section => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__" className="text-primary">
                      <span className="flex items-center gap-2">
                        <IconFolderPlus className="h-4 w-4" />
                        Criar nova seção...
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="lesson-description">Descrição</Label>
              <Textarea
                id="lesson-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do que será abordado na aula"
                rows={2}
              />
            </div>

            {/* Video Content - only show for video type */}
            {formData.type === 'video' && (
              <>
                {/* Video Provider */}
                <div className="space-y-2">
                  <Label>Fonte do Vídeo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.videoProvider === 'youtube' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, videoProvider: 'youtube' }))}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <IconBrandYoutube className="h-4 w-4" />
                      YouTube
                    </Button>
                    <Button
                      type="button"
                      variant={formData.videoProvider === 'vimeo' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, videoProvider: 'vimeo' }))}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <IconPlayerPlay className="h-4 w-4" />
                      Vimeo
                    </Button>
                    <Button
                      type="button"
                      variant={formData.videoProvider === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, videoProvider: 'url' }))}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <IconLink className="h-4 w-4" />
                      URL Externa
                    </Button>
                    <Button
                      type="button"
                      variant={formData.videoProvider === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, videoProvider: 'upload' }))}
                      className="flex items-center gap-2 cursor-pointer"
                      disabled
                      title="Em breve"
                    >
                      <IconUpload className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="lesson-video">
                    {formData.videoProvider === 'youtube' && 'URL do YouTube'}
                    {formData.videoProvider === 'vimeo' && 'URL do Vimeo'}
                    {formData.videoProvider === 'url' && 'URL do Vídeo'}
                    {formData.videoProvider === 'upload' && 'Upload de Vídeo'}
                  </Label>
                  <Input
                    id="lesson-video"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder={
                      formData.videoProvider === 'youtube' 
                        ? 'https://www.youtube.com/watch?v=...' 
                        : formData.videoProvider === 'vimeo'
                        ? 'https://vimeo.com/...'
                        : 'https://...'
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.videoProvider === 'youtube' && 'Cole a URL completa do vídeo do YouTube'}
                    {formData.videoProvider === 'vimeo' && 'Cole a URL completa do vídeo do Vimeo'}
                    {formData.videoProvider === 'url' && 'Cole a URL direta do arquivo de vídeo'}
                    {formData.videoProvider === 'upload' && 'Funcionalidade em desenvolvimento'}
                  </p>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="lesson-duration">Duração (segundos)</Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Ex: 600 (10 minutos)"
                  />
                  {formData.duration && parseInt(formData.duration) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {Math.floor(parseInt(formData.duration) / 60)}min {parseInt(formData.duration) % 60}s
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Article Content - only show for article type */}
            {formData.type === 'article' && (
              <div className="space-y-2">
                <Label>Conteúdo do Artigo</Label>
                <div className="border rounded-md overflow-hidden">
                  <RichTextEditor
                    initialValue={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Escreva o conteúdo do artigo..."
                  />
                </div>
              </div>
            )}

            {/* Audio Content - only show for audio type */}
            {formData.type === 'audio' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="lesson-audio-url">URL do Áudio</Label>
                  <Input
                    id="lesson-audio-url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL direta do arquivo de áudio (MP3, WAV, etc.)
                  </p>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="lesson-audio-duration">Duração (segundos)</Label>
                  <Input
                    id="lesson-audio-duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Ex: 300 (5 minutos)"
                  />
                  {formData.duration && parseInt(formData.duration) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {Math.floor(parseInt(formData.duration) / 60)}min {parseInt(formData.duration) % 60}s
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Toggles */}
            <div className="space-y-4 pt-2">
              <label
                htmlFor="lesson-free"
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">
                    Aula Gratuita
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Disponível como preview para não matriculados
                  </p>
                </div>
                <Switch
                  id="lesson-free"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked }))}
                  className="cursor-pointer"
                />
              </label>

              <label
                htmlFor="lesson-published"
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">
                    Publicar Aula
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Se desativado, a aula ficará oculta para os alunos
                  </p>
                </div>
                <Switch
                  id="lesson-published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  className="cursor-pointer"
                />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveLesson} 
              disabled={saving || !formData.title.trim()}
              className="cursor-pointer"
            >
              {saving ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingLesson ? 'Salvar Alterações' : 'Criar Aula'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Aula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aula &quot;{lessonToDelete?.title}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {saving ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
