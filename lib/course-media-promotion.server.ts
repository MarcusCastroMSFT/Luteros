import {
  validateCourseMediaDeclaration,
  type CourseMediaKind,
} from './course-media';
import {
  createFinalBlobName,
  parseCourseMediaReference,
  getPublicCourseImageUrl,
  type ParsedCourseMediaReference,
} from './course-media-paths.server';
import type { CourseMediaStorage } from './course-media-storage.server';

// ─── URL Classification ───────────────────────────────────────────────────────

export type ImageUrlClassification =
  | { type: 'azure-draft'; ref: ParsedCourseMediaReference & { scope: 'staging-draft' } }
  | { type: 'azure-final'; ref: ParsedCourseMediaReference & { scope: 'final' } }
  | { type: 'external' };

export function classifyImageUrl(
  url: string | null | undefined,
  blobEndpoint: string,
): ImageUrlClassification | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    return null;
  }

  const isAzureBlobUrl = parsed.hostname.endsWith('.blob.core.windows.net');
  if (!isAzureBlobUrl) {
    return { type: 'external' };
  }

  let endpoint: URL;
  try {
    endpoint = new URL(blobEndpoint);
  } catch {
    return null;
  }
  if (endpoint.protocol !== 'https:' || parsed.origin !== endpoint.origin) return null;

  // Azure references must never persist SAS tokens or fragments.
  if (parsed.search || parsed.hash) return null;

  // Extract blob name from pathname: /container/path/to/blob.jpg
  const pathParts = parsed.pathname.split('/').filter(Boolean);
  if (pathParts.length < 2) return null;

  const [containerName, ...blobParts] = pathParts;
  if (containerName !== 'course-images') return null;

  const blobName = blobParts.join('/');
  const ref = parseCourseMediaReference(blobName);

  if (!ref) return null;

  if (ref.scope === 'staging-draft') {
    return { type: 'azure-draft', ref };
  }

  if (ref.scope === 'final') {
    return { type: 'azure-final', ref: ref as ParsedCourseMediaReference & { scope: 'final' } };
  }

  // staging-course is not a valid persisted state
  return null;
}

// ─── Draft Promotion ───────────────────────────────────────────────────────────

export interface PromoteDraftImageOptions {
  url: string;
  courseId: string;
  kind: CourseMediaKind;
  expectedOwnerFingerprint: string;
  containerName: string;
  blobEndpoint: string;
}

export type PromoteDraftImageResult =
  | { ok: true; finalUrl: string }
  | { ok: false; error: string };

export async function promoteOwnedDraftImage(
  options: PromoteDraftImageOptions,
  storage: CourseMediaStorage,
): Promise<PromoteDraftImageResult> {
  const { url, courseId, kind, expectedOwnerFingerprint, containerName, blobEndpoint } = options;

  // Classify the URL
  const classification = classifyImageUrl(url, blobEndpoint);

  if (!classification) {
    return { ok: false, error: 'URL inválida' };
  }

  if (classification.type === 'external') {
    return { ok: true, finalUrl: url };
  }

  if (classification.type !== 'azure-draft') {
    return { ok: false, error: 'URL não é um rascunho Azure' };
  }

  const { ref } = classification;

  // Verify owner fingerprint
  if (ref.ownerFingerprint !== expectedOwnerFingerprint) {
    return { ok: false, error: 'Rascunho não pertence ao usuário autenticado' };
  }

  // Verify kind matches
  if (ref.kind !== kind) {
    return { ok: false, error: 'Tipo de mídia não corresponde' };
  }

  // Inspect the blob to get actual properties
  let inspection;
  try {
    inspection = await storage.inspect(containerName, ref.blobName);
  } catch (_error) {
    return { ok: false, error: 'Blob não encontrado ou inacessível' };
  }

  const declaration = validateCourseMediaDeclaration({
    kind,
    contentType: inspection.contentType,
    size: inspection.contentLength,
  });
  if (!declaration.ok) {
    return { ok: false, error: declaration.error };
  }

  // Generate final blob name
  let finalBlobName: string;
  try {
    finalBlobName = createFinalBlobName({
      courseId,
      kind,
      contentType: inspection.contentType,
    });
  } catch {
    return { ok: false, error: 'Propriedades do blob inválidas' };
  }

  const finalRef = parseCourseMediaReference(finalBlobName);
  if (!finalRef || finalRef.scope !== 'final') {
    return { ok: false, error: 'Falha ao gerar referência final' };
  }

  // Promote staging draft to final
  let promoteResult;
  try {
    promoteResult = await storage.promote(
      containerName,
      ref,
      finalRef as ParsedCourseMediaReference & { scope: 'final' },
      {
        expectedContentLength: inspection.contentLength,
        expectedContentType: inspection.contentType,
        expectedOwnerFingerprint,
      },
    );
  } catch {
    return { ok: false, error: 'Falha ao promover imagem' };
  }

  if (!promoteResult.ok) {
    return { ok: false, error: promoteResult.error };
  }

  // Generate public URL for the final blob
  const finalUrl = getPublicCourseImageUrl(blobEndpoint, finalBlobName);
  if (!finalUrl) {
    return { ok: false, error: 'Falha ao gerar URL final' };
  }

  return { ok: true, finalUrl };
}

// ─── Final URL Validation ──────────────────────────────────────────────────────

export function validateFinalImageUrl(
  url: string | null | undefined,
  courseId: string,
  kind: CourseMediaKind,
  blobEndpoint: string,
): { ok: true } | { ok: false; error: string } {
  if (!url) return { ok: true }; // null/undefined is acceptable (no image)

  const classification = classifyImageUrl(url, blobEndpoint);

  if (!classification) {
    return { ok: false, error: 'URL inválida' };
  }

  if (classification.type === 'external') {
    // External URLs (Vercel, CDN) are acceptable
    return { ok: true };
  }

  if (classification.type === 'azure-draft') {
    return { ok: false, error: 'Não é permitido persistir URLs de rascunho' };
  }

  // azure-final: verify it belongs to this course and matches kind
  const { ref } = classification;
  if (ref.courseId !== courseId) {
    return { ok: false, error: 'Imagem não pertence a este curso' };
  }

  if (ref.kind !== kind) {
    return { ok: false, error: 'Tipo de mídia não corresponde' };
  }

  return { ok: true };
}

// ─── Cleanup Selection ─────────────────────────────────────────────────────────

export interface CleanupSelection {
  blobsToDelete: Array<{ containerName: string; ref: ParsedCourseMediaReference & { scope: 'final' } }>;
}

export function selectReplacedAzureImages(
  oldUrl: string | null | undefined,
  newUrl: string | null | undefined,
  courseId: string,
  kind: CourseMediaKind,
  blobEndpoint: string,
): CleanupSelection {
  const result: CleanupSelection = { blobsToDelete: [] };

  // If the old URL is the same as the new URL, no cleanup needed
  if (oldUrl === newUrl) return result;

  // Classify old URL
  const oldClassification = classifyImageUrl(oldUrl, blobEndpoint);

  // Only cleanup old Azure final blobs
  if (!oldClassification || oldClassification.type !== 'azure-final') {
    return result;
  }

  const { ref } = oldClassification;

  // Verify it belongs to this course and matches kind
  if (ref.courseId !== courseId || ref.kind !== kind) {
    return result;
  }

  // Safe to delete this blob
  result.blobsToDelete.push({
    containerName: 'course-images',
    ref,
  });

  return result;
}
