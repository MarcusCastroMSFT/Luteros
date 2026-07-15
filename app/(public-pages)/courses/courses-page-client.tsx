'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { CourseCard } from '@/components/courses/courseCard';
import { Pagination } from '@/components/common/pagination';
import { EmptyState } from '@/components/common/empty-state';
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
        <EmptyState
          variant={activeCategory !== 'Todos' ? 'search' : 'courses'}
          title="Nenhum curso encontrado"
          description={
            activeCategory !== 'Todos'
              ? `Não encontramos cursos na categoria “${activeCategory}”. Explore outras categorias.`
              : 'Novos cursos sobre saúde sexual e bem-estar chegam em breve. Volte logo!'
          }
          action={activeCategory !== 'Todos' ? { label: 'Ver todos os cursos', onClick: () => handleCategoryChange('Todos') } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course as import('@/types/course').Course}
              priority={i < 4}
            />
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
