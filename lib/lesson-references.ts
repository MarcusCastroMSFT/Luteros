import { z } from 'zod';

export const lessonReferencesSchema = z.string().nullable().optional();

export function resolveLessonReferences(
  type: string,
  references: string | null | undefined,
  existing: string | null = null,
): string | null {
  if (type !== 'article') return null;
  if (references === undefined) return existing;
  return references?.trim() || null;
}
