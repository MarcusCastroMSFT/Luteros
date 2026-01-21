'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CourseContent } from '@/components/courses/courseContent';
import { LessonViewer } from '@/components/lessons/lessonViewer';
import { CourseLessonsSkeleton } from '@/components/lessons/courseLessonsSkeleton';
import { Course, Lesson, CourseApiResponse } from '@/types/course';

export default function CourseLessonsPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/courses-public/${slug}`);
        const result: CourseApiResponse = await response.json();

        if (!result.success || !result.data) {
          setError('Curso não encontrado');
          return;
        }

        const foundCourse = result.data.course;
        setCourse(foundCourse);
        
        // Check if there's a lesson parameter in the URL
        const lessonId = searchParams.get('lesson');
        let selectedLesson: Lesson | null = null;
        
        if (lessonId) {
          // Find the lesson by ID across all sections
          for (const section of foundCourse.sections) {
            const lesson = section.lessons.find((l: Lesson) => l.id === lessonId);
            if (lesson) {
              selectedLesson = lesson;
              break;
            }
          }
        }
        
        // If no lesson found by ID or no ID provided, set first lesson as default
        if (!selectedLesson && foundCourse.sections.length > 0 && foundCourse.sections[0].lessons.length > 0) {
          selectedLesson = foundCourse.sections[0].lessons[0];
        }
        
        setCurrentLesson(selectedLesson);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Erro ao carregar o curso');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [slug, searchParams]);

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
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
    if (!course) return [];
    return course.sections.flatMap(section => section.lessons);
  };

  const getCurrentLessonIndex = (): number => {
    if (!currentLesson) return -1;
    const allLessons = getAllLessons();
    return allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  };

  const navigateToLesson = (direction: 'previous' | 'next') => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    
    if (direction === 'previous' && currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  if (isLoading) {
    return <CourseLessonsSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Curso não encontrado'}
          </div>
          <div className="text-gray-600">
            {error || 'O curso solicitado não pôde ser encontrado.'}
          </div>
        </div>
      </div>
    );
  }

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
              {completedLessons.size} de {getAllLessons().length} aulas concluídas
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
                sections={course.sections} 
                onLessonSelect={handleLessonSelect}
                currentLessonId={currentLesson?.id}
                completedLessons={completedLessons}
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
                canNavigateNext={getCurrentLessonIndex() < getAllLessons().length - 1}
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
