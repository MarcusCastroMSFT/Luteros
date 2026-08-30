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

const CourseContent = dynamic(
  () => import('@/components/courses/courseContent').then(mod => mod.CourseContent),
  { loading: () => <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />, ssr: true }
);

const InstructorCard = dynamic(
  () => import('@/components/instructors/instructorCard').then(mod => mod.InstructorCard),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />, ssr: true }
);

interface RawLesson {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  order: number;
  sectionTitle: string | null;
  isFree: boolean;
  type: 'video' | 'article' | 'audio';
  videoUrl: string | null;
  videoProvider: string | null;
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

  useEffect(() => {
    const abortController = new AbortController();
    async function checkEnrollment() {
      try {
        const response = await fetch(`/api/courses/${course.id}/enroll`, { signal: abortController.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (data.success && data.isEnrolled) setIsEnrolled(true);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error checking enrollment:', error);
      }
    }
    checkEnrollment();
    return () => abortController.abort();
  }, [course.id]);

  const sections = useMemo(() => {
    const sectionsMap = new Map<string, Lesson[]>();
    lessons.forEach((lesson) => {
      const sectionTitle = lesson.sectionTitle || 'Lições';
      if (!sectionsMap.has(sectionTitle)) sectionsMap.set(sectionTitle, []);
      sectionsMap.get(sectionTitle)!.push({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        type: lesson.type || 'video',
        duration: lesson.duration ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}` : '0:00',
        isPreview: lesson.isFree,
        order: lesson.order,
        videoUrl: lesson.videoUrl || undefined,
        videoProvider: lesson.videoProvider || undefined,
      });
    });
    const result: CourseSection[] = [];
    let sectionIndex = 0;
    sectionsMap.forEach((sectionLessons, title) => {
      const totalSeconds = lessons.filter((lesson) => (lesson.sectionTitle || 'Lições') === title).reduce((acc, lesson) => acc + (lesson.duration || 0), 0);
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
      router.push(`/courses/${slug}/lessons`);
      return;
    }
    if (isEnrolling) return;
    setIsEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
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
      router.push(`/courses/${slug}/lessons`);
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Erro ao se inscrever no curso. Tente novamente.');
    } finally {
      setIsEnrolling(false);
    }
  }, [isEnrolled, isEnrolling, course.id, slug, router]);

  const formatStudentsCount = (count: number) => count >= 1000 ? `${Math.floor(count / 1000)}k` : count.toString();

  const courseForInfo = useMemo(() => ({
    ...course,
    video: course.previewVideo,
    image: course.coverImage || course.image,
    originalPrice: course.originalPrice ?? undefined,
    sections,
    includes: [`${course.lessonsCount} aulas`, course.duration, 'Acesso vitalício', 'Certificado de conclusão'],
  }), [course, sections]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={course.title} description={course.shortDescription || course.description} align="left" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cursos', href: '/courses' }, { label: course.category }]} />
      <div className="container mx-auto px-4 max-w-[1428px] py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:-mt-52 relative z-10">
              <CourseInfo course={courseForInfo} onEnroll={handleEnroll} isEnrolling={isEnrolling} isEnrolled={isEnrolled} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8 lg:space-y-12 order-last lg:order-first">
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="font-medium text-gray-900">{course.rating}</span><span>({course.reviewsCount} avaliações)</span></div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} /><span>{formatStudentsCount(course.studentsCount)} estudantes</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} /><span>{course.duration}</span></div>
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} /><span>{course.lessonsCount} aulas</span></div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} /><span>{course.language}</span></div>
            </div>
            <div><h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre o Curso</h2><div className="prose prose-lg max-w-none text-gray-700"><p>{course.description}</p></div></div>
            <div className="border-t border-gray-200" />
            {sections.length > 0 && <div><h2 className="text-2xl font-bold text-gray-900 mb-2">Conteúdo do Curso</h2><p className="text-gray-600 mb-6">{sections.length} seções • {lessons.length} aulas • {course.duration}</p><CourseContent sections={sections} courseSlug={slug} showAllSections={false} /></div>}
            <div className="border-t border-gray-200" />
            <div><h2 className="text-2xl font-bold text-gray-900 mb-6">Instrutor</h2><InstructorCard instructor={course.instructor} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}