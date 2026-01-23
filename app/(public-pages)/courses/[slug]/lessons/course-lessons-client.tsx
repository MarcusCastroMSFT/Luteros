'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { IconCheck } from '@tabler/icons-react';
import { CourseContent } from '@/components/courses/courseContent';
import { LessonViewer } from '@/components/lessons/lessonViewer';
import { CourseSection, Lesson } from '@/types/course';
import { type Course as CourseType } from '@/lib/courses';
import { cn } from '@/lib/utils';

// Type for raw lessons from the API
interface RawLesson {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  order: number;
  sectionTitle: string | null;
  isFree: boolean;
  type: 'video' | 'article' | 'audio';
}

interface CourseLessonsClientProps {
  course: CourseType;
  lessons: RawLesson[];
  slug: string;
  initialLessonId?: string;
}

export function CourseLessonsClient({ course, lessons, slug, initialLessonId }: CourseLessonsClientProps) {
  // Transform lessons into sections (memoized for performance)
  const sections = useMemo(() => {
    const sectionsMap = new Map<string, Lesson[]>();
    
    lessons.forEach((lesson) => {
      const sectionTitle = lesson.sectionTitle || 'Lições';
      if (!sectionsMap.has(sectionTitle)) {
        sectionsMap.set(sectionTitle, []);
      }
      sectionsMap.get(sectionTitle)!.push({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        type: lesson.type || 'video',
        duration: lesson.duration ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}` : '0:00',
        isPreview: lesson.isFree,
        order: lesson.order,
      });
    });
    
    const result: CourseSection[] = [];
    let sectionIndex = 0;
    sectionsMap.forEach((sectionLessons, title) => {
      const totalSeconds = lessons
        .filter((l) => (l.sectionTitle || 'Lições') === title)
        .reduce((acc, l) => acc + (l.duration || 0), 0);
      result.push({
        id: `section-${sectionIndex++}`,
        title,
        lessons: sectionLessons.sort((a, b) => a.order - b.order),
        totalDuration: `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`,
      });
    });
    
    return result;
  }, [lessons]);

  // Find initial lesson
  const initialLesson = useMemo(() => {
    if (initialLessonId) {
      for (const section of sections) {
        const lesson = section.lessons.find((l) => l.id === initialLessonId);
        if (lesson) return lesson;
      }
    }
    // Default to first lesson
    if (sections.length > 0 && sections[0].lessons.length > 0) {
      return sections[0].lessons[0];
    }
    return null;
  }, [sections, initialLessonId]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(initialLesson);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Fetch initial progress from API
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchProgress() {
      try {
        const response = await fetch(`/api/courses/${course.id}/progress`, {
          signal: abortController.signal,
        });
        if (!response.ok) return;

        const data = await response.json();
        if (data.success && data.data.completedLessonIds) {
          setCompletedLessons(new Set(data.data.completedLessonIds));
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error fetching progress:', error);
      }
    }

    fetchProgress();

    return () => abortController.abort();
  }, [course.id]);

  const handleLessonSelect = useCallback((lesson: Lesson) => {
    setCurrentLesson(lesson);
    // Update URL without navigation for better UX
    const newUrl = `/courses/${slug}/lessons?lesson=${lesson.id}`;
    window.history.replaceState({}, '', newUrl);
  }, [slug]);

  const markLessonComplete = useCallback(async (lessonId: string) => {
    if (isUpdatingProgress) return;
    
    // Optimistic update
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    setIsUpdatingProgress(true);

    try {
      const response = await fetch(`/api/courses/${course.id}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert on error
        setCompletedLessons(prev => {
          const newSet = new Set(prev);
          newSet.delete(lessonId);
          return newSet;
        });
        toast.error(data.error || 'Erro ao marcar aula como concluída');
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      // Revert on error
      setCompletedLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
      toast.error('Erro ao salvar progresso');
    } finally {
      setIsUpdatingProgress(false);
    }
  }, [course.id, isUpdatingProgress]);

  const markLessonIncomplete = useCallback(async (lessonId: string) => {
    if (isUpdatingProgress) return;

    // Store previous state for rollback
    const wasCompleted = completedLessons.has(lessonId);
    
    // Optimistic update
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.delete(lessonId);
      return newSet;
    });
    setIsUpdatingProgress(true);

    try {
      const response = await fetch(`/api/courses/${course.id}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert on error
        if (wasCompleted) {
          setCompletedLessons(prev => new Set([...prev, lessonId]));
        }
        toast.error(data.error || 'Erro ao desmarcar aula');
      }
    } catch (error) {
      console.error('Error marking lesson incomplete:', error);
      // Revert on error
      if (wasCompleted) {
        setCompletedLessons(prev => new Set([...prev, lessonId]));
      }
      toast.error('Erro ao salvar progresso');
    } finally {
      setIsUpdatingProgress(false);
    }
  }, [course.id, isUpdatingProgress, completedLessons]);

  // Memoize allLessons to prevent recalculation on every render
  const allLessons = useMemo(() => {
    return sections.flatMap(section => section.lessons);
  }, [sections]);

  // Calculate progress percentage (memoized)
  const progressPercent = useMemo(() => {
    if (allLessons.length === 0) return 0;
    return Math.round((completedLessons.size / allLessons.length) * 100);
  }, [completedLessons.size, allLessons.length]);

  // Memoize current lesson index
  const currentLessonIndex = useMemo(() => {
    if (!currentLesson) return -1;
    return allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  }, [currentLesson, allLessons]);

  const navigateToLesson = useCallback((direction: 'previous' | 'next') => {
    let newLesson: Lesson | null = null;
    if (direction === 'previous' && currentLessonIndex > 0) {
      newLesson = allLessons[currentLessonIndex - 1];
    } else if (direction === 'next' && currentLessonIndex < allLessons.length - 1) {
      newLesson = allLessons[currentLessonIndex + 1];
    }
    
    if (newLesson) {
      setCurrentLesson(newLesson);
      // Update URL
      const newUrl = `/courses/${slug}/lessons?lesson=${newLesson.id}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [currentLessonIndex, allLessons, slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {course.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {completedLessons.size} de {allLessons.length} aulas concluídas
              </p>
            </div>
            
            {/* Circular Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{progressPercent}% completo</p>
              </div>
              <div className="w-12 h-12 relative">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={125.66}
                    strokeDashoffset={125.66 - (progressPercent / 100) * 125.66}
                    className={cn(
                      "transition-all duration-500",
                      progressPercent >= 100 ? "text-green-500" : "text-primary"
                    )}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900">
                  {progressPercent >= 100 ? (
                    <IconCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    `${progressPercent}%`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left Column - Course Content */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Conteúdo do Curso
              </h2>
              <CourseContent 
                sections={sections} 
                onLessonSelect={handleLessonSelect}
                currentLessonId={currentLesson?.id}
                completedLessons={completedLessons}
                showAllSections={true}
              />
            </div>
          </div>

          {/* Right Column - Lesson Viewer */}
          <div className="xl:col-span-3">
            {currentLesson ? (
              <LessonViewer
                lesson={currentLesson}
                isCompleted={completedLessons.has(currentLesson.id)}
                onMarkComplete={() => markLessonComplete(currentLesson.id)}
                onMarkIncomplete={() => markLessonIncomplete(currentLesson.id)}
                onNavigate={navigateToLesson}
                canNavigatePrevious={currentLessonIndex > 0}
                canNavigateNext={currentLessonIndex < allLessons.length - 1}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-600">
                  Selecione uma aula para começar
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
