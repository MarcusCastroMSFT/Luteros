'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton';
import { CourseCard } from '@/components/courses/courseCard';
import { CourseListSkeleton } from '@/components/courses/courseSkeleton';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { type Course, type CoursesPagination } from '@/types/course';

const COURSES_PER_PAGE = 12;

interface CoursesPageClientProps {
  initialCourses: Course[];
  initialPagination: CoursesPagination;
  initialCategories: string[];
}

export function CoursesPageClient({
  initialCourses,
  initialPagination,
  initialCategories,
}: CoursesPageClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [pagination, setPagination] = useState<CoursesPagination | null>(initialPagination);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (page: number = 1, category: string = 'Todos') => {
    setLoadingCourses(true);
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
      const data = await response.json();

      if (data.success && data.data) {
        setCourses(data.data.courses);
        setPagination(data.data.pagination);
        // Only update categories if they're different
        if (data.data.categories.length > 0) {
          setCategories(data.data.categories);
        }
      } else {
        setError(data.error || 'Erro ao carregar cursos');
      }
    } catch (err) {
      setError('Erro ao carregar cursos');
      console.error('Error fetching courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Fetch when category changes (after initial load)
  useEffect(() => {
    if (activeCategory !== 'Todos' || currentPage !== 1) {
      fetchCourses(currentPage, activeCategory);
    }
  }, [activeCategory, currentPage, fetchCourses]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button 
          onClick={() => fetchCourses(currentPage, activeCategory)}
          className="cursor-pointer"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Filters Section - Centered */}
      <div className="flex justify-center mb-12">
        {categories.length === 0 ? (
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
      {loadingCourses ? (
        <CourseListSkeleton count={COURSES_PER_PAGE} />
      ) : (
        <>
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
    </>
  );
}
