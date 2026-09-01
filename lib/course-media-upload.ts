import { BlockBlobClient } from '@azure/storage-blob';
import type { CourseMediaKind } from './course-media';

export type CourseMediaUploadResult =
  | { kind: 'thumbnail' | 'cover'; url: string }
  | { kind: 'lesson-video'; blobName: string; videoProvider: 'azure' };

export type CourseBlockBlobClientFactory = (
  sasUrl: string,
) => Pick<BlockBlobClient, 'uploadData'>;

interface UploadCourseMediaOptions {
  kind: CourseMediaKind;
  courseId?: string;
  lessonId?: string;
  signal?: AbortSignal;
  onProgress?: (loadedBytes: number, totalBytes: number) => void;
  fetchImpl?: typeof fetch;
  clientFactory?: CourseBlockBlobClientFactory;
}

interface InitiationResponse {
  uploadId: string;
  sasUrl: string;
  blockSize: number;
  concurrency: number;
}

function defaultClientFactory(sasUrl: string): Pick<BlockBlobClient, 'uploadData'> {
  return new BlockBlobClient(sasUrl);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(`Upload request failed (${response.status})`);
  }
}

function readError(body: unknown, status: number): Error {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return new Error(body.error);
  }
  return new Error(`Upload request failed (${status})`);
}

function parseInitiation(body: unknown): InitiationResponse {
  if (!body || typeof body !== 'object') throw new Error('Invalid upload response');
  const value = body as Record<string, unknown>;
  if (
    typeof value.uploadId !== 'string'
    || typeof value.sasUrl !== 'string'
    || typeof value.blockSize !== 'number'
    || !Number.isSafeInteger(value.blockSize)
    || value.blockSize <= 0
    || typeof value.concurrency !== 'number'
    || !Number.isSafeInteger(value.concurrency)
    || value.concurrency <= 0
  ) {
    throw new Error('Invalid upload response');
  }
  return {
    uploadId: value.uploadId,
    sasUrl: value.sasUrl,
    blockSize: value.blockSize,
    concurrency: value.concurrency,
  };
}

function parseCompletion(body: unknown, kind: CourseMediaKind): CourseMediaUploadResult {
  if (!body || typeof body !== 'object') throw new Error('Invalid completion response');
  const value = body as Record<string, unknown>;
  if (
    (kind === 'thumbnail' || kind === 'cover')
    && value.kind === kind
    && typeof value.url === 'string'
  ) {
    return { kind, url: value.url };
  }
  if (
    kind === 'lesson-video'
    && value.kind === 'lesson-video'
    && typeof value.blobName === 'string'
    && value.videoProvider === 'azure'
  ) {
    return { kind: 'lesson-video', blobName: value.blobName, videoProvider: 'azure' };
  }
  throw new Error('Invalid completion response');
}

export async function uploadCourseMedia(
  file: File,
  options: UploadCourseMediaOptions,
): Promise<CourseMediaUploadResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const clientFactory = options.clientFactory ?? defaultClientFactory;
  const baseUrl = options.courseId
    ? `/api/courses/${encodeURIComponent(options.courseId)}/media/uploads`
    : '/api/courses/media/uploads';
  const initiationBody = {
    kind: options.kind,
    contentType: file.type,
    size: file.size,
    ...(options.lessonId ? { lessonId: options.lessonId } : {}),
  };

  const initiationResponse = await fetchImpl(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(initiationBody),
    signal: options.signal,
  });
  const initiationJson = await readJson(initiationResponse);
  if (!initiationResponse.ok) throw readError(initiationJson, initiationResponse.status);
  const initiation = parseInitiation(initiationJson);
  let reportedBytes = -1;
  const reportProgress = (loadedBytes: number) => {
    if (loadedBytes === reportedBytes) return;
    reportedBytes = loadedBytes;
    options.onProgress?.(loadedBytes, file.size);
  };

  const blobClient = clientFactory(initiation.sasUrl);
  reportProgress(0);
  await blobClient.uploadData(file, {
    abortSignal: options.signal,
    blockSize: initiation.blockSize,
    concurrency: initiation.concurrency,
    blobHTTPHeaders: { blobContentType: file.type },
    onProgress: options.onProgress
      ? ({ loadedBytes }) => reportProgress(loadedBytes)
      : undefined,
  });
  reportProgress(file.size);

  const completionResponse = await fetchImpl(
    `${baseUrl}/${encodeURIComponent(initiation.uploadId)}/complete`,
    { method: 'POST', signal: options.signal },
  );
  const completionJson = await readJson(completionResponse);
  if (!completionResponse.ok) throw readError(completionJson, completionResponse.status);
  return parseCompletion(completionJson, options.kind);
}