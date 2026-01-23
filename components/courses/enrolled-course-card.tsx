'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, BookOpen, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type EnrolledCourse } from '@/app/api/users/enrolled-courses/route';

interface EnrolledCourseCardProps {
  enrollment: EnrolledCourse;
}

export function EnrolledCourseCard({ enrollment }: EnrolledCourseCardProps) {
  const { course, progressPercent, completedAt, lastAccessedAt, completedLessons, totalLessons } = enrollment;
  const isCompleted = completedAt !== null || progressPercent === 100;

  // Format last accessed date
  const formatLastAccessed = (dateString: string | null) => {
    if (!dateString) return 'Nunca acessado';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Acessado hoje';
    if (diffDays === 1) return 'Acessado ontem';
    if (diffDays < 7) return `Acessado há ${diffDays} dias`;
    if (diffDays < 30) return `Acessado há ${Math.floor(diffDays / 7)} semanas`;
    return `Acessado há ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Course Image */}
      <Link href={`/courses/${course.slug}/lessons`} className="block relative">
        <div className="relative h-40 overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isCompleted ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Concluído
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                Em andamento
              </Badge>
            )}
          </div>
          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </Link>

      {/* Course Content */}
      <div className="p-5">
        {/* Category & Level */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs font-normal">
            {course.category}
          </Badge>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{course.level}</span>
        </div>

        {/* Title */}
        <Link href={`/courses/${course.slug}/lessons`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>

        {/* Course Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessonsCount} aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progresso</span>
            <span className="font-medium text-gray-900">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{completedLessons} de {totalLessons} aulas</span>
            <span>{formatLastAccessed(lastAccessedAt)}</span>
          </div>
        </div>

        {/* Instructor & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Image
              src={course.instructor.avatar}
              alt={course.instructor.name}
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-sm text-gray-600 truncate max-w-[120px]">
              {course.instructor.name}
            </span>
          </div>
          <Button asChild size="sm" variant={isCompleted ? 'outline' : 'default'}>
            <Link href={`/courses/${course.slug}/lessons`} className="flex items-center gap-1">
              {isCompleted ? 'Revisar' : 'Continuar'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
