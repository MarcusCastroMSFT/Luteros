import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, BookOpen, Users, ArrowRight } from 'lucide-react';
import { type CourseCardProps } from '@/types/course';

const formatStudentsCount = (count: number) => {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k`
  }
  return count.toString()
}

export function CourseCard({ course, showInstructor = true }: CourseCardProps) {
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
          />
        </div>
      </Link>

      {/* Course Content */}
      <div className="pt-6">
        {/* Course Meta Info */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessonsCount} Aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{formatStudentsCount(course.studentsCount)} Alunos</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Course Title */}
        <Link href={`/courses/${course.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-primary transition-colors cursor-pointer group inline-flex items-center gap-2">
            <span className="line-clamp-2">{course.title}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </h3>
        </Link>

        {/* Rating and Instructor */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-900">{course.rating}</span>
            <span className="text-gray-500">({course.reviewsCount})</span>
          </div>
          
          {showInstructor && (
            <span className="hover:text-primary transition-colors cursor-pointer">
              Por {course.instructor.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
