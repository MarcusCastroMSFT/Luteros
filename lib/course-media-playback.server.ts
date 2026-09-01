import type { AuthUser } from './auth-helpers';
import type { CourseMediaStorage } from './course-media-storage.server';
import { parseCourseMediaReference } from './course-media-paths.server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface EnrollmentData {
  courseId: string;
  lessonId: string;
  lessonType: 'video' | 'article' | 'audio';
  videoUrl: string | null;
  videoProvider: string | null;
  enrollmentId?: string | null;
  expiresAt: Date | null;
}

export interface CourseMediaPlaybackDeps {
  getAuthUser: () => Promise<AuthUser | null>;
  queryEnrollment: (userId: string, courseId: string, lessonId: string) => Promise<EnrollmentData | null>;
  storage: CourseMediaStorage;
  getNow?: () => Date;
}

export type PlaybackAuthResult =
  | { status: 401; error: string }
  | { status: 403; error: string }
  | { status: 404; error: string }
  | { status: 200; redirectUrl: string };

export interface CourseMediaPlaybackService {
  authorizePlayback(courseId: string, lessonId: string): Promise<PlaybackAuthResult>;
}

export function createCourseMediaPlaybackService(deps: CourseMediaPlaybackDeps): CourseMediaPlaybackService {
  const { getAuthUser, queryEnrollment, storage, getNow = () => new Date() } = deps;

  return {
    async authorizePlayback(courseId: string, lessonId: string): Promise<PlaybackAuthResult> {
      // 1. Require authentication
      const user = await getAuthUser();
      if (!user) {
        return { status: 401, error: 'Unauthorized' };
      }

      if (!UUID_PATTERN.test(courseId) || !UUID_PATTERN.test(lessonId)) {
        return { status: 404, error: 'Lesson not found' };
      }

      // 2. Query enrollment and lesson relationship
      const enrollment = await queryEnrollment(user.id, courseId, lessonId);
      if (!enrollment) {
        return { status: 404, error: 'Lesson not found' };
      }

      // 3. Verify lesson belongs to course before disclosing enrollment state.
      if (enrollment.courseId !== courseId) {
        return { status: 404, error: 'Lesson not found' };
      }

      // 4. Check enrollment; equality at expiry is still active per plan spec.
      if (enrollment.enrollmentId === null) {
        return { status: 403, error: 'Not enrolled in course' };
      }
      if (enrollment.expiresAt && enrollment.expiresAt < getNow()) {
        return { status: 403, error: 'Enrollment expired' };
      }

      // 5. Require Azure provider
      if (enrollment.videoProvider !== 'azure') {
        return { status: 404, error: 'Media not found' };
      }

      // 6. Validate blob reference
      if (!enrollment.videoUrl) {
        return { status: 404, error: 'Invalid media reference' };
      }

      const expectedKind = enrollment.lessonType === 'video'
        ? 'lesson-video'
        : enrollment.lessonType === 'audio'
          ? 'lesson-audio'
          : null;
      if (!expectedKind) {
        return { status: 404, error: 'Media not found' };
      }

      const parsed = parseCourseMediaReference(enrollment.videoUrl, {
        expectedCourseId: courseId,
        expectedKind,
      });

      if (!parsed || parsed.scope !== 'final') {
        return { status: 404, error: 'Invalid media reference' };
      }

      // 7. Generate 5-minute read SAS and return redirect
      const redirectUrl = await storage.createReadUrl('course-videos', enrollment.videoUrl);

      // Never log the SAS URL
      return { status: 200, redirectUrl };
    },
  };
}
