'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { IconCheck, IconList, IconChevronLeft } from '@tabler/icons-react';
import { CourseContent } from '@/components/courses/courseContent';
import { LessonViewer } from '@/components/lessons/lessonViewer';
import { CourseSection, Lesson } from '@/types/course';
import { type Course as CourseType } from '@/lib/courses';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RawLesson { id: string; title: string; description: string | null; duration: number | null; order: number; sectionTitle: string | null; isFree: boolean; type: 'video' | 'article' | 'audio'; videoUrl: string | null; videoProvider: string | null; }
interface CourseLessonsClientProps { course: CourseType; lessons: RawLesson[]; slug: string; initialLessonId?: string; }

export function CourseLessonsClient({ course, lessons, slug, initialLessonId }: CourseLessonsClientProps) {
  const sections = useMemo(() => {
    const sectionsMap = new Map<string, Lesson[]>();
    lessons.forEach((lesson) => {
      const sectionTitle = lesson.sectionTitle || 'Lições';
      if (!sectionsMap.has(sectionTitle)) sectionsMap.set(sectionTitle, []);
      sectionsMap.get(sectionTitle)!.push({ id: lesson.id, title: lesson.title, description: lesson.description || '', type: lesson.type || 'video', duration: lesson.duration ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}` : '0:00', isPreview: lesson.isFree, order: lesson.order, videoUrl: lesson.videoUrl || undefined, videoProvider: lesson.videoProvider || undefined });
    });
    const result: CourseSection[] = [];
    let sectionIndex = 0;
    sectionsMap.forEach((sectionLessons, title) => {
      const totalSeconds = lessons.filter((lesson) => (lesson.sectionTitle || 'Lições') === title).reduce((acc, lesson) => acc + (lesson.duration || 0), 0);
      result.push({ id: `section-${sectionIndex++}`, title, lessons: sectionLessons.sort((a, b) => a.order - b.order), totalDuration: `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}` });
    });
    return result;
  }, [lessons]);

  const initialLesson = useMemo(() => {
    if (initialLessonId) for (const section of sections) { const lesson = section.lessons.find((item) => item.id === initialLessonId); if (lesson) return lesson; }
    return sections[0]?.lessons[0] || null;
  }, [sections, initialLessonId]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(initialLesson);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchProgress() {
      try {
        const response = await fetch(`/api/courses/${course.id}/progress`, { signal: abortController.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (data.success && data.data.completedLessonIds) setCompletedLessons(new Set(data.data.completedLessonIds));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error fetching progress:', error);
      }
    }
    fetchProgress();
    return () => abortController.abort();
  }, [course.id]);

  const handleLessonSelect = useCallback((lesson: Lesson) => { setCurrentLesson(lesson); setIsMobileSidebarOpen(false); window.history.replaceState({}, '', `/courses/${slug}/lessons?lesson=${lesson.id}`); }, [slug]);

  const updateProgress = useCallback(async (lessonId: string, isCompleted: boolean) => {
    if (isUpdatingProgress) return;
    const previous = completedLessons.has(lessonId);
    setCompletedLessons((current) => { const next = new Set(current); if (isCompleted) next.add(lessonId); else next.delete(lessonId); return next; });
    setIsUpdatingProgress(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/lessons/${lessonId}/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isCompleted }) });
      const data = await response.json();
      if (!response.ok) {
        setCompletedLessons((current) => { const next = new Set(current); if (previous) next.add(lessonId); else next.delete(lessonId); return next; });
        toast.error(data.error || 'Erro ao salvar progresso');
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      setCompletedLessons((current) => { const next = new Set(current); if (previous) next.add(lessonId); else next.delete(lessonId); return next; });
      toast.error('Erro ao salvar progresso');
    } finally { setIsUpdatingProgress(false); }
  }, [course.id, isUpdatingProgress, completedLessons]);

  const allLessons = useMemo(() => sections.flatMap((section) => section.lessons), [sections]);
  const progressPercent = allLessons.length === 0 ? 0 : Math.round((completedLessons.size / allLessons.length) * 100);
  const currentLessonIndex = currentLesson ? allLessons.findIndex((lesson) => lesson.id === currentLesson.id) : -1;
  const navigateToLesson = useCallback((direction: 'previous' | 'next') => {
    const offset = direction === 'previous' ? -1 : 1;
    const lesson = allLessons[currentLessonIndex + offset];
    if (lesson) { setCurrentLesson(lesson); window.history.replaceState({}, '', `/courses/${slug}/lessons?lesson=${lesson.id}`); }
  }, [currentLessonIndex, allLessons, slug]);

  const content = <CourseContent sections={sections} onLessonSelect={handleLessonSelect} currentLessonId={currentLesson?.id} completedLessons={completedLessons} showAllSections className="p-4" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40"><div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8"><div className="py-3 md:py-4 flex items-center gap-3">
        <Link href={`/courses/${slug}`} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors shrink-0"><IconChevronLeft size={20} className="text-gray-600" /></Link>
        <div className="flex-1 min-w-0"><h1 className="text-base md:text-xl font-bold text-gray-900 truncate">{course.title}</h1><div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={cn('h-full rounded-full transition-all duration-500', progressPercent >= 100 ? 'bg-green-500' : 'bg-brand-600')} style={{ width: `${progressPercent}%` }} /></div><span className="text-xs text-gray-600 shrink-0">{completedLessons.size}/{allLessons.length}</span></div></div>
        <div className="hidden md:flex items-center gap-3"><div className="text-right"><p className="text-sm font-medium text-gray-900">{progressPercent}% completo</p><p className="text-xs text-gray-500">{completedLessons.size} de {allLessons.length} aulas</p></div><div className="w-12 h-12 relative"><svg className="w-12 h-12 transform -rotate-90"><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" /><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={125.66} strokeDashoffset={125.66 - (progressPercent / 100) * 125.66} className={cn('transition-all duration-500', progressPercent >= 100 ? 'text-green-500' : 'text-primary')} /></svg><span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900">{progressPercent >= 100 ? <IconCheck className="h-5 w-5 text-green-500" /> : `${progressPercent}%`}</span></div></div>
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}><SheetTrigger asChild><Button variant="outline" size="sm" className="xl:hidden h-9 px-3"><IconList size={18} /><span className="ml-2 hidden sm:inline">Aulas</span></Button></SheetTrigger><SheetContent side="right" className="w-full sm:w-[400px] p-0"><SheetHeader className="p-4 border-b bg-gray-50"><SheetTitle className="text-left">Conteúdo do Curso</SheetTitle><p className="text-sm text-gray-600">{sections.length} seções • {allLessons.length} aulas</p></SheetHeader><div className="overflow-y-auto h-[calc(100vh-100px)]">{content}</div></SheetContent></Sheet>
      </div></div></div>
      <div className="max-w-[1400px] mx-auto"><div className="flex flex-col xl:flex-row"><div className="hidden xl:block xl:w-[380px] xl:shrink-0 border-r border-gray-200 bg-white"><div className="sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto"><div className="p-4 border-b bg-gray-50"><h2 className="text-lg font-semibold text-gray-900">Conteúdo do Curso</h2><p className="text-sm text-gray-600 mt-1">{sections.length} seções • {allLessons.length} aulas</p></div>{content}</div></div><div className="flex-1 min-w-0"><div className="p-3 sm:p-6">{currentLesson ? <LessonViewer lesson={currentLesson} isCompleted={completedLessons.has(currentLesson.id)} onMarkComplete={() => updateProgress(currentLesson.id, true)} onMarkIncomplete={() => updateProgress(currentLesson.id, false)} onNavigate={navigateToLesson} canNavigatePrevious={currentLessonIndex > 0} canNavigateNext={currentLessonIndex < allLessons.length - 1} currentIndex={currentLessonIndex} totalLessons={allLessons.length} /> : <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"><div className="text-gray-600">Selecione uma aula para começar</div></div>}</div></div></div></div>
    </div>
  );
}