import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Type for enrollment from Prisma query
interface EnrollmentWithCourse {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt: Date | null;
  expiresAt: Date | null;
  progressPercent: number;
  paidAmount: unknown;
  paymentStatus: string | null;
  courses: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    thumbnail: string | null;
    category: string;
    level: string;
    duration: number | null;
    user_profiles: {
      id: string;
      fullName: string | null;
      displayName: string | null;
      avatar: string | null;
    };
    _count: {
      lessons: number;
    };
  };
}

// Type for enrolled course with progress (API response)
export interface EnrolledCourse {
  id: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  course: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    thumbnail: string;
    category: string;
    level: string;
    duration: string;
    lessonsCount: number;
    instructor: {
      id: string;
      name: string;
      avatar: string;
    };
  };
  lastAccessedAt: string | null;
  completedLessons: number;
  totalLessons: number;
}

// Format duration from minutes to readable string
function formatDuration(minutes: number | null): string {
  if (!minutes) return '0h';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export async function GET(request: NextRequest) {
  // Signal that this route uses request-specific data (auth cookies)
  await connection();

  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado para ver seus cursos' },
        { status: 401 }
      );
    }

    // Parse query params for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status'); // 'in-progress', 'completed', 'all'

    // Build where condition
    const whereCondition: {
      userId: string;
      completedAt?: null | { not: null };
    } = {
      userId: user.id,
    };

    // Filter by completion status
    if (status === 'in-progress') {
      whereCondition.completedAt = null;
    } else if (status === 'completed') {
      whereCondition.completedAt = { not: null };
    }

    // Fetch enrollments with course data and progress
    const [enrollments, totalCount, courseProgress] = await Promise.all([
      prisma.enrollments.findMany({
        where: whereCondition,
        include: {
          courses: {
            select: {
              id: true,
              slug: true,
              title: true,
              shortDescription: true,
              thumbnail: true,
              category: true,
              level: true,
              duration: true,
              user_profiles: {
                select: {
                  id: true,
                  fullName: true,
                  displayName: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  lessons: {
                    where: { isPublished: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollments.count({ where: whereCondition }),
      // Get progress for all enrolled courses
      prisma.course_progress.findMany({
        where: { userId: user.id },
        select: {
          courseId: true,
          completedLessons: true,
          totalLessons: true,
          progressPercent: true,
          lastAccessedAt: true,
        },
      }),
    ]);

    // Type for course progress
    type CourseProgressItem = {
      courseId: string;
      completedLessons: number;
      totalLessons: number;
      progressPercent: number;
      lastAccessedAt: Date | null;
    };

    // Create a map of course progress for quick lookup
    const progressMap = new Map<string, CourseProgressItem>(
      courseProgress.map((p: CourseProgressItem) => [p.courseId, p])
    );

    // Transform data for response
    const enrolledCourses: EnrolledCourse[] = (enrollments as EnrollmentWithCourse[]).map((enrollment) => {
      const course = enrollment.courses;
      const progress = progressMap.get(course.id) as CourseProgressItem | undefined;
      const instructorName = course.user_profiles.fullName || course.user_profiles.displayName || 'Instrutor';

      return {
        id: enrollment.id,
        courseId: course.id,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt: enrollment.completedAt?.toISOString() || null,
        progressPercent: progress?.progressPercent || enrollment.progressPercent || 0,
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          shortDescription: course.shortDescription || '',
          thumbnail: course.thumbnail || '/images/course-placeholder.jpg',
          category: course.category,
          level: course.level,
          duration: formatDuration(course.duration),
          lessonsCount: course._count.lessons,
          instructor: {
            id: course.user_profiles.id,
            name: instructorName,
            avatar: course.user_profiles.avatar || '/images/default-avatar.jpg',
          },
        },
        lastAccessedAt: progress?.lastAccessedAt?.toISOString() || null,
        completedLessons: progress?.completedLessons || 0,
        totalLessons: progress?.totalLessons || course._count.lessons,
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        enrolledCourses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses: totalCount,
          coursesPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        stats: {
          total: totalCount,
          inProgress: (enrollments as EnrollmentWithCourse[]).filter((e) => !e.completedAt).length,
          completed: (enrollments as EnrollmentWithCourse[]).filter((e) => e.completedAt).length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar seus cursos' },
      { status: 500 }
    );
  }
}
