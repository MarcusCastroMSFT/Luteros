import {
  uploadCourseMedia,
  type CourseMediaUploadResult,
} from './course-media-upload';

export interface LessonSavePayload {
  title: string;
  type: 'video' | 'article' | 'audio';
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  videoProvider: string | null;
  duration: number | null;
  sectionTitle: string | null;
  isPublished: boolean;
  isFree: boolean;
}

interface DeferredMediaUploadOptions {
  kind: 'lesson-video' | 'lesson-audio';
  courseId: string;
  lessonId: string;
}

interface SaveLessonOptions {
  courseId: string;
  lessonId?: string;
  payload: LessonSavePayload;
  mediaFile?: File | null;
  fetchImpl?: typeof fetch;
  uploadImpl?: (
    file: File,
    options: DeferredMediaUploadOptions,
  ) => Promise<CourseMediaUploadResult>;
}

interface LessonMutationResponse {
  success: boolean;
  data?: { id?: string };
  error?: string;
}

export class LessonSaveError extends Error {
  constructor(message: string, readonly lessonId?: string) {
    super(message);
    this.name = 'LessonSaveError';
  }
}

async function mutateLesson(
  fetchImpl: typeof fetch,
  url: string,
  method: 'POST' | 'PUT',
  payload: LessonSavePayload,
): Promise<LessonMutationResponse> {
  const response = await fetchImpl(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json() as LessonMutationResponse;
  if (!response.ok || !result.success) {
    throw new LessonSaveError(result.error || 'Failed to save lesson');
  }
  return result;
}

export async function saveLessonWithDeferredMedia({
  courseId,
  lessonId,
  payload,
  mediaFile,
  fetchImpl = fetch,
  uploadImpl = uploadCourseMedia,
}: SaveLessonOptions): Promise<{ lessonId: string; mediaUploaded: boolean }> {
  const baseUrl = `/api/courses/${encodeURIComponent(courseId)}/lessons`;
  const deferredKind = payload.type === 'video'
    ? 'lesson-video'
    : payload.type === 'audio'
      ? 'lesson-audio'
      : null;
  const deferredFile = deferredKind ? mediaFile : null;

  if (lessonId) {
    await mutateLesson(fetchImpl, `${baseUrl}/${encodeURIComponent(lessonId)}`, 'PUT', payload);
    return { lessonId, mediaUploaded: false };
  }

  const createPayload = deferredFile
    ? { ...payload, videoUrl: null, isPublished: false }
    : payload;
  const created = await mutateLesson(fetchImpl, baseUrl, 'POST', createPayload);
  const createdLessonId = created.data?.id;
  if (!createdLessonId) {
    throw new LessonSaveError('Invalid lesson creation response');
  }

  if (!deferredFile || !deferredKind) {
    return { lessonId: createdLessonId, mediaUploaded: false };
  }

  try {
    const uploaded = await uploadImpl(deferredFile, {
      kind: deferredKind,
      courseId,
      lessonId: createdLessonId,
    });
    if (uploaded.kind !== deferredKind) {
      throw new Error('Invalid media upload response');
    }

    await mutateLesson(
      fetchImpl,
      `${baseUrl}/${encodeURIComponent(createdLessonId)}`,
      'PUT',
      {
        ...payload,
        videoUrl: uploaded.blobName,
        videoProvider: uploaded.videoProvider,
      },
    );
    return { lessonId: createdLessonId, mediaUploaded: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload lesson media';
    throw new LessonSaveError(message, createdLessonId);
  }
}