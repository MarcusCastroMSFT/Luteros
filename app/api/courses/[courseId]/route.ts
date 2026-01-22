import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

type CourseWithInstructor = {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string | null
  level: string
  category: string
  language: string
  duration: number | null
  thumbnail: string | null
  coverImage: string | null
  previewVideo: string | null
  price: { toString(): string } | null
  discountPrice: { toString(): string } | null
  isFree: boolean
  isPublished: boolean
  publishedAt: Date | null
  enrollmentCount: number
  averageRating: { toString(): string } | null
  reviewCount: number
  createdAt: Date
  updatedAt: Date
  user_profiles: {
    id: string
    fullName: string | null
    displayName: string | null
    avatar: string | null
  }
  _count: {
    lessons: number
  }
}

// Format duration from minutes to readable string
const formatDuration = (minutes: number | null): string => {
  if (!minutes) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

// Map level from database format to Portuguese
const levelDisplayMap: Record<string, string> = {
  'BEGINNER': 'Iniciante',
  'INTERMEDIATE': 'Intermediário',
  'ADVANCED': 'Avançado',
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    // Require authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return 401/403 response
    }
    
    // In Next.js 15, params is a Promise
    const params = await context.params;
    const courseId = params.courseId;

    // Fetch course with instructor details (optimized query)
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
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
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const typedCourse = course as CourseWithInstructor;
    const price = typedCourse.price ? parseFloat(typedCourse.price.toString()) : 0;
    const discountPrice = typedCourse.discountPrice ? parseFloat(typedCourse.discountPrice.toString()) : null;
    const rating = typedCourse.averageRating ? parseFloat(typedCourse.averageRating.toString()) : 0;

    // Transform to match frontend Course type
    const transformedCourse = {
      id: typedCourse.id,
      slug: typedCourse.slug,
      title: typedCourse.title,
      description: typedCourse.description,
      shortDescription: typedCourse.shortDescription || '',
      thumbnail: typedCourse.thumbnail || '',
      coverImage: typedCourse.coverImage || '',
      previewVideo: typedCourse.previewVideo || '',
      category: typedCourse.category,
      level: levelDisplayMap[typedCourse.level] || typedCourse.level,
      language: typedCourse.language,
      duration: typedCourse.duration,
      durationFormatted: formatDuration(typedCourse.duration),
      price,
      discountPrice,
      isFree: typedCourse.isFree,
      isPublished: typedCourse.isPublished,
      publishedAt: typedCourse.publishedAt?.toISOString() || null,
      enrollmentCount: typedCourse.enrollmentCount,
      rating,
      reviewCount: typedCourse.reviewCount,
      lessonsCount: typedCourse._count.lessons,
      instructor: {
        id: typedCourse.user_profiles.id,
        name: typedCourse.user_profiles.fullName || typedCourse.user_profiles.displayName || 'Unknown',
        avatar: typedCourse.user_profiles.avatar || '/images/default-avatar.jpg',
      },
      createdAt: typedCourse.createdAt.toISOString(),
      updatedAt: typedCourse.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedCourse,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET raw course data for editing (without transformation)
export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  // This is just to check if the course exists
  try {
    const params = await context.params;
    const courseId = params.courseId;

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    // Require authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return 401/403 response
    }
    
    // In Next.js 15, params is a Promise
    const params = await context.params;
    const courseId = params.courseId;

    // Parse request body
    const body = await request.json();
    const { 
      title, 
      slug, 
      description, 
      shortDescription,
      level,
      category,
      language,
      duration,
      thumbnail,
      coverImage,
      previewVideo,
      price,
      discountPrice,
      isFree,
      isPublished,
      instructorId,
    } = body;

    // Validation
    if (!title || !slug || !description || !level || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Valid levels
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Iniciante', 'Intermediário', 'Avançado'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, error: 'Nível inválido' },
        { status: 400 }
      );
    }

    // Map Portuguese levels to database format
    const levelMap: Record<string, string> = {
      'Iniciante': 'BEGINNER',
      'Intermediário': 'INTERMEDIATE', 
      'Avançado': 'ADVANCED',
    };
    const dbLevel = levelMap[level] || level;

    // Check if course exists
    const existingCourse = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it conflicts with another course
    if (slug !== existingCourse.slug) {
      const slugConflict = await prisma.courses.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'Já existe um curso com esse slug' },
          { status: 400 }
        );
      }
    }

    // Update course
    const updatedCourse = await prisma.courses.update({
      where: { id: courseId },
      data: {
        title,
        slug,
        description,
        shortDescription: shortDescription || null,
        level: dbLevel,
        category,
        language: language || existingCourse.language,
        duration: duration !== undefined ? duration : existingCourse.duration,
        thumbnail: thumbnail || null,
        coverImage: coverImage || null,
        previewVideo: previewVideo || null,
        price: price !== undefined ? (price ? parseFloat(price) : null) : existingCourse.price,
        discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : existingCourse.discountPrice,
        isFree: isFree !== undefined ? isFree : existingCourse.isFree,
        isPublished: isPublished !== undefined ? isPublished : existingCourse.isPublished,
        publishedAt: isPublished && !existingCourse.isPublished ? new Date() : existingCourse.publishedAt,
        instructorId: instructorId || existingCourse.instructorId,
      },
      include: {
        user_profiles: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    });

    // Invalidate cache so users see the updated course immediately
    revalidatePath('/courses');
    revalidatePath(`/courses/${slug}`);
    // Also revalidate old slug if it changed
    if (slug !== existingCourse.slug) {
      revalidatePath(`/courses/${existingCourse.slug}`);
      revalidateTag(`course-${existingCourse.slug}`, {});
    }
    revalidateTag('courses', {});
    revalidateTag('courses-initial', {});
    revalidateTag('course-slugs', {});
    revalidateTag(`course-${slug}`, {});
    revalidateTag('courses-stats', {});

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar curso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    // Require authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return 401/403 response
    }
    
    // In Next.js 15, params is a Promise
    const params = await context.params;
    const courseId = params.courseId;

    // Check if course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, slug: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete the course (cascade will handle related records like lessons, enrollments, etc.)
    await prisma.courses.delete({
      where: { id: courseId },
    });

    // Invalidate cache so the deleted course is removed from listings
    revalidatePath('/courses');
    revalidatePath(`/courses/${course.slug}`);
    revalidateTag('courses', {});
    revalidateTag('courses-initial', {});
    revalidateTag('course-slugs', {});
    revalidateTag(`course-${course.slug}`, {});
    revalidateTag('courses-stats', {});

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
