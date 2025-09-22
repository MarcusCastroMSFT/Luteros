'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { CourseCard } from '@/components/courses/courseCard';
import { CourseListSkeleton } from '@/components/courses/courseSkeleton';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { type Course, type CoursesApiResponse, type CoursesPagination } from '@/types/course';

const COURSES_PER_PAGE = 12;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<CoursesPagination | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (page: number = 1, category: string = 'Todos') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: COURSES_PER_PAGE.toString(),
      });

      if (category !== 'Todos') {
        params.append('category', category);
      }

      const response = await fetch(`/api/courses-public?${params}`);
      const data: CoursesApiResponse = await response.json();

      if (data.success && data.data) {
        setCourses(data.data.courses);
        setPagination(data.data.pagination);
        setCategories(data.data.categories);
      } else {
        setError(data.error || 'Erro ao carregar cursos');
      }
    } catch (err) {
      setError('Erro ao carregar cursos');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1, activeCategory);
    setCurrentPage(1);
  }, [activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCourses(page, activeCategory);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Cursos' }
  ];

  if (error) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title="Cursos"
          description="Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis."
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-4 max-w-[1428px] py-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchCourses(currentPage, activeCategory)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* No Results */}
        {!loading && courses.length === 0 && !error && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeCategory !== 'Todos' 
                ? `Não foram encontrados cursos na categoria "${activeCategory}".`
                : 'Não há cursos disponíveis no momento.'
              }
            </p>
            {activeCategory !== 'Todos' && (
              <Button onClick={() => handleCategoryChange('Todos')}>
                Ver todos os cursos
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
