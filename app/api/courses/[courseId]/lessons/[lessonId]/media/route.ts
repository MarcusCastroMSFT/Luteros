import { type NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { enrollments, lessons } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth-helpers';
import { createCourseMediaPlaybackService, type EnrollmentData } from '@/lib/course-media-playback.server';
import { courseMediaStorage } from '@/lib/course-media-storage.server';
import { getClientIp } from '@/lib/client-ip';
import { registerCourseAccess } from '@/lib/course-access-limit.server';
import { isIPv4 } from 'node:net';

interface RouteParams {
  courseId: string;
  lessonId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
): Promise<Response> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const { courseId, lessonId } = params;

  // Query enrollment and lesson relationship in one flow
  async function queryEnrollment(userId: string, courseId: string, lessonId: string): Promise<EnrollmentData | null> {
    const result = await db
      .select({
        courseId: lessons.courseId,
        lessonId: lessons.id,
        lessonType: lessons.type,
        videoUrl: lessons.videoUrl,
        videoProvider: lessons.videoProvider,
        enrollmentId: enrollments.id,
        expiresAt: enrollments.expiresAt,
        paymentStatus: enrollments.paymentStatus,
      })
      .from(lessons)
      .leftJoin(enrollments, and(
        eq(enrollments.courseId, lessons.courseId),
        eq(enrollments.userId, userId)
      ))
      .where(and(
        eq(lessons.id, lessonId)
      ))
      .limit(1);

    return result[0] ?? null;
  }

  // Create playback service
  const clientIp = getClientIp(request.headers);
  const userAgent = request.headers.get('user-agent');
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => user,
    queryEnrollment,
    storage: courseMediaStorage,
    registerAccess: (userId, accessCourseId) =>
      registerCourseAccess(userId, accessCourseId, { ipAddress: clientIp, userAgent }),
  });

  // Opt-in: tie the media URL itself to the requester's IPv4 so a copied link is useless elsewhere.
  const bindToIp = process.env.COURSE_MEDIA_BIND_SAS_TO_IP === 'true' && clientIp && isIPv4(clientIp)
    ? clientIp
    : undefined;

  // Authorize playback
  const result = await service.authorizePlayback(courseId, lessonId, { bindToIp });

  if (result.status !== 200) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  // Return 307 redirect with Cache-Control headers
  return NextResponse.redirect(result.redirectUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });
}
