import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { type CourseCardProps } from '@/types/course';
import { formatLessonCount } from '@/lib/course-labels';

export function CourseCard({ course, showInstructor = true, priority = false }: CourseCardProps & { priority?: boolean }) {
  return (
    <div className="overflow-hidden">
      {/* Course Image */}
      <Link href={`/courses/${course.slug}`}>
        <div className="relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg group">
          <Image
            src={course.image}
            alt={course.title}
            width={400}
            height={240}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
            quality={85}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
          />
        </div>
      </Link>

      {/* Course Content */}
      <div className="pt-6">
        {/* Course Meta Info */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{formatLessonCount(course.lessonsCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-gray-900">{course.rating}</span>
          <span className="text-gray-500">({course.reviewsCount})</span>
        </div>

        {/* Course Title */}
        <Link href={`/courses/${course.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-primary transition-colors cursor-pointer group inline-flex items-center gap-2">
            <span className="line-clamp-2">{course.title}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </h3>
        </Link>

        {showInstructor && (
          <span className="text-sm text-gray-600 hover:text-primary transition-colors cursor-pointer">
            Por {course.instructor.name}
          </span>
        )}
      </div>
    </div>
  );
}
