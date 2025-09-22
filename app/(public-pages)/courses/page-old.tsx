'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { CourseCard } from '@/components/courses/courseCard';
import { CourseListSkeleton } from '@/components/courses/courseSkeleton';
import { Pagination } from '@/components/common/pagination';
import { sampleCourses } from '@/data/courses';
import { Button } from '@/components/ui/button';

const COURSES_PER_PAGE = 12;

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get unique categories from courses
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(sampleCourses.map(course => course.category)));
    return ['Todos', ...uniqueCategories];
  }, []);

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    if (activeCategory === 'Todos') {
      return sampleCourses;
    }
    return sampleCourses.filter(course => course.category === activeCategory);
  }, [activeCategory]);

  // Paginate courses
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const endIndex = startIndex + COURSES_PER_PAGE;
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setLoading(true);
    setActiveCategory(category);
    setCurrentPage(1);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handlePageChange = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Cursos' }
  ];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Cursos"
        description="Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis."
        breadcrumbs={breadcrumbs}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-[1428px] py-16">
        {/* Filters Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Courses Grid */}
        {loading ? (
          <CourseListSkeleton count={COURSES_PER_PAGE} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* No Results */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Não foram encontrados cursos na categoria &quot;{activeCategory}&quot;.
            </p>
            <Button onClick={() => handleCategoryChange('Todos')}>
              Ver todos os cursos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
