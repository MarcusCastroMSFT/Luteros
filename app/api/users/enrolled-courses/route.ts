import { NextRequest, NextResponse, connection } from 'next/server';
import { and, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { courses, courseProgress, enrollments, users } from '@/lib/db/schema';

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
  await connection();

  try {
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;
    const userId = authUser.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status');

    const statusCondition =
      status === 'in-progress'
        ? isNull(enrollments.completedAt)
        : status === 'completed'
          ? isNotNull(enrollments.completedAt)
          : undefined;

    const whereCondition = and(eq(enrollments.userId, userId), statusCondition);

    const instructors = alias(users, 'instructor');

    const [enrollmentRows, [{ total }], progressRows] = await Promise.all([
      db
        .select({
          id: enrollments.id,
          courseId: enrollments.courseId,
          enrolledAt: enrollments.enrolledAt,
          completedAt: enrollments.completedAt,
          progressPercent: enrollments.progressPercent,
          courseSlug: courses.slug,
          courseTitle: courses.title,
          courseShortDescription: courses.shortDescription,
          courseThumbnail: courses.thumbnail,
          courseCategory: courses.category,
          courseLevel: courses.level,
          courseDuration: courses.duration,
          instructorId: instructors.id,
          instructorName: instructors.name,
          instructorDisplayName: instructors.displayName,
          instructorAvatar: instructors.image,
          lessonsCount: sql<number>`(SELECT COUNT(*)::int FROM "lessons" WHERE "courseId" = ${courses.id} AND "isPublished" = true)`,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .innerJoin(instructors, eq(courses.instructorId, instructors.id))
        .where(whereCondition)
        .orderBy(desc(enrollments.enrolledAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(enrollments).where(whereCondition),
      db
        .select({
          courseId: courseProgress.courseId,
          completedLessons: courseProgress.completedLessons,
          totalLessons: courseProgress.totalLessons,
          progressPercent: courseProgress.progressPercent,
          lastAccessedAt: courseProgress.lastAccessedAt,
        })
        .from(courseProgress)
        .where(eq(courseProgress.userId, userId)),
    ]);

    const progressMap = new Map(progressRows.map((p) => [p.courseId, p]));

    const enrolledCourses: EnrolledCourse[] = enrollmentRows.map((row) => {
      const progress = progressMap.get(row.courseId);
      const instructorName = row.instructorName || row.instructorDisplayName || 'Instrutor';
      return {
        id: row.id,
        courseId: row.courseId,
        enrolledAt: row.enrolledAt.toISOString(),
        completedAt: row.completedAt?.toISOString() || null,
        progressPercent: progress?.progressPercent ?? row.progressPercent ?? 0,
        course: {
          id: row.courseId,
          slug: row.courseSlug,
          title: row.courseTitle,
          shortDescription: row.courseShortDescription || '',
          thumbnail: row.courseThumbnail || '/images/course-placeholder.jpg',
          category: row.courseCategory,
          level: row.courseLevel,
          duration: formatDuration(row.courseDuration),
          lessonsCount: row.lessonsCount,
          instructor: {
            id: row.instructorId,
            name: instructorName,
            avatar: row.instructorAvatar || '/images/default-avatar.svg',
          },
        },
        lastAccessedAt: progress?.lastAccessedAt?.toISOString() || null,
        completedLessons: progress?.completedLessons ?? 0,
        totalLessons: progress?.totalLessons ?? row.lessonsCount,
      };
    });

    const totalNum = Number(total);
    const totalPages = Math.ceil(totalNum / limit);

    return NextResponse.json({
      success: true,
      data: {
        enrolledCourses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses: totalNum,
          coursesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          total: totalNum,
          inProgress: enrollmentRows.filter((e) => !e.completedAt).length,
          completed: enrollmentRows.filter((e) => e.completedAt).length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar seus cursos' },
      { status: 500 },
    );
  }
}
