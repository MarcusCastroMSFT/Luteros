'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { CourseCard } from '@/components/courses/courseCard';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { type Course, type CoursesPagination } from '@/lib/courses';

interface CoursesPageClientProps {
  courses: Course[];
  pagination: CoursesPagination;
  categories: string[];
  activeCategory: string;
}

export function CoursesPageClient({
  courses,
  pagination,
  categories,
  activeCategory,
}: CoursesPageClientProps) {
  const router = useRouter();

  const buildUrl = (page: number, category: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (category && category !== 'Todos') params.set('category', category);
    const qs = params.toString();
    return qs ? `/courses?${qs}` : '/courses';
  };

  const handleCategoryChange = (category: string) => {
    router.push(buildUrl(1, category));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl(page, activeCategory));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Filters Section - Centered */}
      <div className="flex justify-center mb-12">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum curso encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {activeCategory !== 'Todos'
              ? `Não encontramos cursos na categoria "${activeCategory}".`
              : 'Não há cursos disponíveis no momento.'
            }
          </p>
          {activeCategory !== 'Todos' && (
            <Button onClick={() => handleCategoryChange('Todos')} className="cursor-pointer">
              Ver todos os cursos
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course as import('@/types/course').Course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
