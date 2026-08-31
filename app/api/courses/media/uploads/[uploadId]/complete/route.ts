import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { courses, lessons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { completeCourseMediaUpload } from '@/lib/course-media-upload-service.server';
import { courseMediaStorage } from '@/lib/course-media-storage.server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { uploadId } = await params;

  const result = await completeCourseMediaUpload(user, { uploadId }, {
    storage: courseMediaStorage,
    findCourse: async (id) => {
      const [c] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
      return c;
    },
    findLesson: async (id) => {
      const [l] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
      return l;
    },
    getNow: () => new Date(),
    getSecret: () => process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '',
    getBlobEndpoint: () => {
      const ep = process.env.AZURE_STORAGE_BLOB_ENDPOINT;
      if (!ep) throw new Error('AZURE_STORAGE_BLOB_ENDPOINT is required');
      return ep;
    },
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json(result.result, { status: 200 });
}
