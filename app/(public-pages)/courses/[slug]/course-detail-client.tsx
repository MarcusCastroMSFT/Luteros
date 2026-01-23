'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/pageHeader';
import { CourseInfo } from '@/components/courses/courseInfo';
import { Star, Clock, BookOpen, Users, Globe } from 'lucide-react';
import { type Course as CourseType } from '@/lib/courses';
import { CourseSection, Lesson } from '@/types/course';

// Dynamic imports for non-critical components (below the fold)
const CourseContent = dynamic(
  () => import('@/components/courses/courseContent').then(mod => mod.CourseContent),
  { 
    loading: () => <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />,
    ssr: true 
  }
);

const InstructorCard = dynamic(
  () => import('@/components/instructors/instructorCard').then(mod => mod.InstructorCard),
  { 
    loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />,
    ssr: true 
  }
);

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

interface CourseDetailClientProps {
  course: CourseType;
  lessons: RawLesson[];
  slug: string;
}

export function CourseDetailClient({ course, lessons, slug }: CourseDetailClientProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Check enrollment status on mount with AbortController for cleanup
  useEffect(() => {
    const abortController = new AbortController();
    
    async function checkEnrollment() {
      try {
        const response = await fetch(`/api/courses/${course.id}/enroll`, {
          signal: abortController.signal,
        });
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.success && data.isEnrolled) {
          setIsEnrolled(true);
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error checking enrollment:', error);
      }
    }
    
    checkEnrollment();
    
    return () => abortController.abort();
  }, [course.id]);

  // Transform lessons into sections
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

  const handleEnroll = useCallback(async () => {
    if (isEnrolled) {
      // Already enrolled, navigate to course lessons
      router.push(`/courses/${slug}/lessons`);
      return;
    }

    if (isEnrolling) return; // Prevent double-clicks

    setIsEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Você precisa estar logado para se inscrever no curso');
          router.push('/login?redirect=' + encodeURIComponent(`/courses/${slug}`));
          return;
        }
        toast.error(data.error || 'Erro ao se inscrever no curso');
        return;
      }

      toast.success(data.message || 'Você foi inscrito no curso com sucesso!');
      setIsEnrolled(true);
      
      // Redirect to course lessons after successful enrollment
      router.push(`/courses/${slug}/lessons`);
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Erro ao se inscrever no curso. Tente novamente.');
    } finally {
      setIsEnrolling(false);
    }
  }, [isEnrolled, isEnrolling, course.id, slug, router]);

  const formatStudentsCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  // Create a course-like object for CourseInfo component - memoized to prevent re-renders
  const courseForInfo = useMemo(() => ({
    ...course,
    video: course.previewVideo,
    image: course.image || course.coverImage,
    originalPrice: course.originalPrice ?? undefined,
    sections: sections,
    includes: [
      `${course.lessonsCount} aulas`,
      course.duration,
      'Acesso vitalício',
      'Certificado de conclusão',
    ],
  }), [course, sections]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <PageHeader
        title={course.title}
        description={course.shortDescription || course.description}
        align="left"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cursos', href: '/courses' },
          { label: course.category }
        ]}
      />
      
      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{course.rating}</span>
                <span>({course.reviewsCount} avaliações)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{formatStudentsCount(course.studentsCount)} estudantes</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{course.lessonsCount} aulas</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{course.language}</span>
              </div>
            </div>

            {/* Course Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Sobre o Curso
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>{course.description}</p>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200"></div>

            {/* Course Content Section */}
            {sections.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Conteúdo do Curso
                </h2>
                <p className="text-gray-600 mb-6">
                  {sections.length} seções • {lessons.length} aulas • {course.duration}
                </p>
                <CourseContent 
                  sections={sections} 
                  courseSlug={slug}
                  showAllSections={false}
                />
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-gray-200"></div>

            {/* Instructor Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Instrutor
              </h2>
              <InstructorCard instructor={course.instructor} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:-mt-52 relative z-10">
              <CourseInfo
                course={courseForInfo}
                onEnroll={handleEnroll}
                isEnrolling={isEnrolling}
                isEnrolled={isEnrolled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
