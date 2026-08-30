import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCourseMetadata, getEnrolledCourseBySlug } from '@/lib/courses';
import { getAuthUser } from '@/lib/auth-helpers';
import { CourseLessonsClient } from './course-lessons-client';
import { CourseLessonsSkeleton } from '@/components/lessons/courseLessonsSkeleton';

interface LessonsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: LessonsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = await getCourseMetadata(slug);
  
  if (!metadata) {
    return {
      title: 'Curso não encontrado',
    };
  }
  
  return {
    title: `${metadata.title} - Aulas | lutteros`,
    description: `Assista às aulas do curso ${metadata.title}. ${metadata.description}`,
    openGraph: {
      title: `${metadata.title} - Aulas | lutteros`,
      description: `Assista às aulas do curso ${metadata.title}.`,
      type: 'website',
      images: metadata.image ? [{ url: metadata.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metadata.title} - Aulas | lutteros`,
      description: `Assista às aulas do curso ${metadata.title}.`,
      images: metadata.image ? [metadata.image] : [],
    },
    robots: {
      index: false, // Don't index lesson pages - require enrollment
      follow: true,
    },
    alternates: {
      canonical: `/courses/${slug}/lessons`,
    },
  };
}

// Server component to fetch course data
async function LessonsContent({ slug, initialLessonId }: { slug: string; initialLessonId?: string }) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect(`/login?redirect=${encodeURIComponent(`/courses/${slug}/lessons`)}`);
  }

  const courseData = await getEnrolledCourseBySlug(slug, authUser.id);
  
  if (!courseData) {
    redirect(`/courses/${slug}`);
  }
  
  return (
    <CourseLessonsClient 
      course={courseData.course} 
      lessons={courseData.lessons}
      slug={slug}
      initialLessonId={initialLessonId}
    />
  );
}

export default async function CourseLessonsPage({ params, searchParams }: LessonsPageProps) {
  const { slug } = await params;
  const { lesson: lessonId } = await searchParams;
  
  return (
    <Suspense fallback={<CourseLessonsSkeleton />}>
      <LessonsContent slug={slug} initialLessonId={lessonId} />
    </Suspense>
  );
}