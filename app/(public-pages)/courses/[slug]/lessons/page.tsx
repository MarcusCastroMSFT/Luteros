import { Suspense } from 'react';
import { preconnect } from 'react-dom';
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

function getCourseMediaOrigin(): string | null {
  try {
    const endpoint = process.env.AZURE_STORAGE_BLOB_ENDPOINT;
    return endpoint ? new URL(endpoint).origin : null;
  } catch {
    return null;
  }
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

  // Videos redirect to Azure Blob Storage; opening that connection early shortens time to first frame.
  const mediaOrigin = getCourseMediaOrigin();
  if (mediaOrigin) {
    preconnect(mediaOrigin);
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
