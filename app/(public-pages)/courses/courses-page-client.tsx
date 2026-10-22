'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { CatalogList } from '@/components/common/catalog-list';
import { EmptyState } from '@/components/common/empty-state';
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

  return (
    <>
      <div className="mb-10">
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
        <CatalogList
          key={`${activeCategory}-${pagination.currentPage}`}
          initialPage={{ kind: 'courses', items: courses, pagination }}
          category={activeCategory}
        />
      )}
    </>
  );
}
