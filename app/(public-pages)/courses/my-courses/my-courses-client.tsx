'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EnrolledCourseCard } from '@/components/courses/enrolled-course-card';
import { type EnrolledCourse } from '@/app/api/users/enrolled-courses/route';
import { useAuth } from '@/contexts/auth-context';

interface MyCoursesStats {
  total: number;
  inProgress: number;
  completed: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  coursesPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type StatusFilter = 'all' | 'in-progress' | 'completed';

export function MyCoursesClient() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<MyCoursesStats>({ total: 0, inProgress: 0, completed: 0 });
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const fetchCourses = useCallback(async (statusFilter: StatusFilter, pageNum: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
      });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/users/enrolled-courses?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirect=' + encodeURIComponent('/courses/my-courses'));
          return;
        }
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      if (data.success) {
        setCourses(data.data.enrolledCourses);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent('/courses/my-courses'));
    }
  }, [user, isAuthLoading, router]);

  // Fetch courses when filters change
  useEffect(() => {
    if (user) {
      fetchCourses(status, page);
    }
  }, [user, status, page, fetchCourses]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as StatusFilter);
    setPage(1); // Reset to first page when changing filter
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Cursos Inscritos</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-sm text-gray-500">Em Andamento</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-500">Concluídos</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={status} onValueChange={handleStatusChange} className="w-full">
        <TabsList className="h-auto p-1 bg-muted/50 border border-border rounded-lg w-fit">
          <TabsTrigger 
            value="all"
            className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Todos ({stats.total})
          </TabsTrigger>
          <TabsTrigger 
            value="in-progress"
            className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4 mr-2 text-amber-500" />
            Em Andamento ({stats.inProgress})
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="cursor-pointer px-5 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            Concluídos ({stats.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'all' 
              ? 'Você ainda não está inscrito em nenhum curso' 
              : status === 'in-progress'
              ? 'Nenhum curso em andamento'
              : 'Nenhum curso concluído ainda'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {status === 'all'
              ? 'Explore nossos cursos e comece sua jornada de aprendizado hoje mesmo!'
              : status === 'in-progress'
              ? 'Continue seus cursos para vê-los aqui.'
              : 'Complete seus cursos para vê-los aqui.'}
          </p>
          {status === 'all' && (
            <Button asChild>
              <a href="/courses">Explorar Cursos</a>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((enrollment) => (
              <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais cursos'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
