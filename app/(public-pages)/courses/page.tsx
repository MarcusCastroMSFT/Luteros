'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton';
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
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchCourses = async (page: number = 1, category: string = 'Todos', isInitial: boolean = false) => {
    // Only show full loading on initial load
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingCourses(true);
    }
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
        // Only set categories on initial load
        if (isInitial || categories.length === 0) {
          setCategories(data.data.categories);
        }
      } else {
        setError(data.error || 'Erro ao carregar cursos');
      }
    } catch (err) {
      setError('Erro ao carregar cursos');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
      setLoadingCourses(false);
      setInitialLoad(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses(1, 'Todos', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category change - only fetch courses, not categories
  useEffect(() => {
    if (!initialLoad) {
      fetchCourses(1, activeCategory, false);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Button 
            onClick={() => fetchCourses(currentPage, activeCategory, true)}
            className="cursor-pointer"
          >
            Tentar novamente
          </Button>
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
        {/* Filters Section - Centered */}
        <div className="flex justify-center mb-12">
          {loading && categories.length === 0 ? (
            <CategoryFilterSkeleton />
          ) : (
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}
        </div>

        {/* Courses Grid */}
        {loading || loadingCourses ? (
          <CourseListSkeleton count={COURSES_PER_PAGE} />
        ) : (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
                  <CourseCard key={course.id} course={course} />
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
        )}
      </div>
    </div>
  );
}