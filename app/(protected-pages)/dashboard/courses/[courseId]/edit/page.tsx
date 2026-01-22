'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CourseForm } from '@/components/courses/course-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconAlertCircle } from '@tabler/icons-react';
import { toast } from 'sonner';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<{
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    coverImage: string;
    previewVideo: string;
    category: string;
    level: string;
    language: string;
    duration: string;
    price: string;
    discountPrice: string;
    isFree: boolean;
    isPublished: boolean;
    instructorId: string;
  } | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/raw`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Course not found');
        }

        const course = result.data;
        
        setCourseData({
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDescription: course.shortDescription || '',
          thumbnail: course.thumbnail || '',
          coverImage: course.coverImage || '',
          previewVideo: course.previewVideo || '',
          category: course.category,
          level: course.level,
          language: course.language,
          duration: course.duration?.toString() || '',
          price: course.price?.toString() || '',
          discountPrice: course.discountPrice?.toString() || '',
          isFree: course.isFree,
          isPublished: course.isPublished,
          instructorId: course.instructorId,
        });
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
        toast.error('Erro ao carregar curso');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </div>
              </div>
            </div>
            <div className="px-4 lg:px-6 space-y-6 max-w-4xl">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  return (
    <CourseForm 
      mode="edit" 
      courseId={courseId}
      initialData={courseData}
    />
  );
}
