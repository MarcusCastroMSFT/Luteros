import { NextRequest, NextResponse, connection } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';

// Transaction client type for Prisma
type TransactionClient = Prisma.TransactionClient;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  // Signal that this route uses request-specific data (auth cookies)
  await connection();

  try {
    const { courseId } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado para se inscrever no curso' },
        { status: 401 }
      );
    }

    // Check if course exists, is published, and if user is already enrolled - single optimized query
    const [course, existingEnrollment] = await Promise.all([
      prisma.courses.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          isFree: true,
          price: true,
        },
      }),
      prisma.enrollments.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
        select: { id: true },
      }),
    ]);

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Este curso não está disponível' },
        { status: 400 }
      );
    }

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Você já está inscrito neste curso' },
        { status: 400 }
      );
    }

    // For paid courses, in the future we'll redirect to payment
    // For now, we'll just create the enrollment directly
    const isPaid = !course.isFree && course.price && Number(course.price) > 0;

    // Use transaction for atomicity - create enrollment and update count together
    const enrollment = await prisma.$transaction(async (tx: TransactionClient) => {
      const newEnrollment = await tx.enrollments.create({
        data: {
          userId: user.id,
          courseId: courseId,
          paidAmount: isPaid ? course.price : 0,
          paymentStatus: isPaid ? 'PENDING' : 'COMPLETED',
        },
      });

      await tx.courses.update({
        where: { id: courseId },
        data: {
          enrollmentCount: {
            increment: 1,
          },
        },
      });

      return newEnrollment;
    });

    // Invalidate cache - Next.js 16 requires empty options object as second argument
    revalidateTag('courses', {});
    revalidateTag(`course-${course.slug}`, {});

    return NextResponse.json({
      success: true,
      message: isPaid 
        ? 'Inscrição realizada! Em breve implementaremos o pagamento.' 
        : 'Você foi inscrito no curso com sucesso!',
      enrollment: {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        courseId: enrollment.courseId,
        courseTitle: course.title,
        courseSlug: course.slug,
      },
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao se inscrever no curso' },
      { status: 500 }
    );
  }
}

// GET - Check if user is enrolled in a course
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  // Signal that this route uses request-specific data (auth cookies)
  await connection();

  try {
    const { courseId } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: true,
        isEnrolled: false,
        enrollment: null,
      });
    }

    // Check enrollment
    const enrollment = await prisma.enrollments.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      select: {
        id: true,
        enrolledAt: true,
        progressPercent: true,
        paymentStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      isEnrolled: !!enrollment,
      enrollment: enrollment,
    });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar inscrição' },
      { status: 500 }
    );
  }
}
