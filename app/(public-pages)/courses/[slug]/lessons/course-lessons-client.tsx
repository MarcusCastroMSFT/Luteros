'use client';

import { useState, useMemo } from 'react';
import { CourseContent } from '@/components/courses/courseContent';
import { LessonViewer } from '@/components/lessons/lessonViewer';
import { CourseSection, Lesson } from '@/types/course';
import { type Course as CourseType } from '@/lib/courses';

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

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    // Update URL without navigation for better UX
    const newUrl = `/courses/${slug}/lessons?lesson=${lesson.id}`;
    window.history.replaceState({}, '', newUrl);
  };

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  const markLessonIncomplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.delete(lessonId);
      return newSet;
    });
  };

  const getAllLessons = (): Lesson[] => {
    return sections.flatMap(section => section.lessons);
  };

  const getCurrentLessonIndex = (): number => {
    if (!currentLesson) return -1;
    const allLessons = getAllLessons();
    return allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  };

  const navigateToLesson = (direction: 'previous' | 'next') => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    
    let newLesson: Lesson | null = null;
    if (direction === 'previous' && currentIndex > 0) {
      newLesson = allLessons[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < allLessons.length - 1) {
      newLesson = allLessons[currentIndex + 1];
    }
    
    if (newLesson) {
      setCurrentLesson(newLesson);
      // Update URL
      const newUrl = `/courses/${slug}/lessons?lesson=${newLesson.id}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  const allLessons = getAllLessons();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {course.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {completedLessons.size} de {allLessons.length} aulas concluídas
            </p>
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
                canNavigatePrevious={getCurrentLessonIndex() > 0}
                canNavigateNext={getCurrentLessonIndex() < allLessons.length - 1}
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
