'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/common/pageHeader';
import { CourseInfo } from '@/components/courses/courseInfo';
import { CourseOverview } from '@/components/courses/courseOverview';
import { CourseContent } from '@/components/courses/courseContent';
import { InstructorCard } from '@/components/instructors/instructorCard';
import { CourseDetailSkeleton } from '@/components/courses/courseDetailSkeleton';
import { Star, Clock, BookOpen, Users, Globe } from 'lucide-react';
import { type Course, type CourseApiResponse } from '@/types/course';

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCourse(slug: string) {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/courses-public/${slug}`, {
      cache: 'no-store', // Ensure fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data: CourseApiResponse = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const { slug } = React.use(params);
  const [courseData, setCourseData] = useState<{ course: Course; relatedCourses: Course[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      
      const data = await getCourse(slug);
      
      if (data) {
        setCourseData(data);
      } else {
        setError('Course not found');
      }
      
      setIsLoading(false);
    };

    fetchCourse();
  }, [slug]);

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (error || !courseData) {
    notFound();
  }

  const { course } = courseData;

  const handleEnroll = () => {
    // Handle enrollment logic
    console.log('Add to cart clicked for course:', course.id);
  };

  const formatStudentsCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <PageHeader
        title={course.title}
        description={course.description}
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
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-white">{course.rating}</span>
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

            {/* Learning Objectives Section */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <CourseOverview course={course} />
            )}

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Course Content Section */}
            {course.sections && course.sections.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Conteúdo do Curso
                </h2>
                <CourseContent 
                  sections={course.sections}
                  totalSections={course.sectionsCount}
                  courseSlug={slug}
                />
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Instructor Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Instrutor
              </h2>
              <InstructorCard instructor={course.instructor} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:-mt-52 relative z-10">
              <CourseInfo
                course={course}
                onEnroll={handleEnroll}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}