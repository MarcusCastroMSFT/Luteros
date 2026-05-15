import { revalidateTag as _revalidateTag } from 'next/cache'

export { revalidatePath } from 'next/cache'

/**
 * Wrapper around Next.js 16 revalidateTag.
 * The built-in type requires 2 args; we default the profile to {}.
 */
export function revalidateTag(tag: string): undefined {
  return _revalidateTag(tag, {})
}
