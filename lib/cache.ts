import { revalidateTag as _revalidateTag } from 'next/cache'

export { revalidatePath } from 'next/cache'

/**
 * Wrapper around Next.js 16 revalidateTag.
 * Expire immediately so mutation responses never leave stale tagged data readable.
 */
export function revalidateTag(tag: string): undefined {
  return _revalidateTag(tag, { expire: 0 })
}
