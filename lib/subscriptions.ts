import 'server-only'
import { and, eq, gt, isNull, or } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { subscriptionPlans, userSubscriptions } from '@/lib/db/schema'

export type ArticleAccessType = 'free' | 'paid'
export type ArticleAudience = 'general' | 'doctors'
export type SubscriptionAudience = 'general' | 'doctors'

interface ArticleForAccess {
  accessType: ArticleAccessType | string
  targetAudience: ArticleAudience | string
}

/**
 * Returns the active subscription audiences for the given user.
 * A subscription is considered active when:
 *   - status === 'ACTIVE' (or TRIAL — we honor trials)
 *   - endsAt is NULL (lifetime) or endsAt is in the future
 *
 * Doctors plan is a superset that also grants 'general' access.
 */
export async function getCurrentUserAudiences(): Promise<Set<SubscriptionAudience>> {
  const session = await auth()
  if (!session?.user?.id) return new Set()

  const rows = await db
    .select({ audience: subscriptionPlans.audience })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        eq(userSubscriptions.userId, session.user.id),
        or(eq(userSubscriptions.status, 'ACTIVE'), eq(userSubscriptions.status, 'TRIAL')),
        or(isNull(userSubscriptions.endsAt), gt(userSubscriptions.endsAt, new Date())),
      ),
    )

  const audiences = new Set<SubscriptionAudience>()
  for (const row of rows) {
    audiences.add(row.audience as SubscriptionAudience)
    // doctors plan is a superset and also grants general access
    if (row.audience === 'doctors') audiences.add('general')
  }
  return audiences
}

interface AccessContext {
  isAuthenticated: boolean
  isStaff: boolean // ADMIN or INSTRUCTOR — bypasses paywall
  audiences: Set<SubscriptionAudience>
}

/**
 * Resolve the current viewer's access context once and pass it around if
 * checking multiple articles in one render pass.
 */
export async function getCurrentUserAccessContext(): Promise<AccessContext> {
  const session = await auth()
  const isAuthenticated = !!session?.user?.id
  const role = session?.user?.role as string | undefined
  const isStaff = role === 'ADMIN' || role === 'INSTRUCTOR'

  // Staff don't need a subscription check — short-circuit the DB call
  if (isStaff) return { isAuthenticated, isStaff: true, audiences: new Set(['general', 'doctors']) }
  if (!isAuthenticated) return { isAuthenticated: false, isStaff: false, audiences: new Set() }

  const audiences = await getCurrentUserAudiences()
  return { isAuthenticated, isStaff: false, audiences }
}

export function hasArticleAccess(
  article: ArticleForAccess,
  context: AccessContext,
): boolean {
  if (article.accessType === 'free') return true
  if (context.isStaff) return true
  const needed = (article.targetAudience as SubscriptionAudience) ?? 'general'
  return context.audiences.has(needed)
}

/**
 * Returns the first N characters of an HTML string with naive tag handling:
 * counts only visible-character length (skips tag bytes) so the teaser feels
 * like ~N characters of *content* regardless of how many tags surround it.
 * Closes any tags left open at the truncation point.
 */
export function truncateHtmlContent(html: string, maxChars: number): string {
  let visibleCount = 0
  let result = ''
  const openTags: string[] = []
  let i = 0

  while (i < html.length && visibleCount < maxChars) {
    const ch = html[i]
    if (ch === '<') {
      const tagEnd = html.indexOf('>', i)
      if (tagEnd === -1) break
      const tagContent = html.slice(i + 1, tagEnd).trim()
      result += html.slice(i, tagEnd + 1)
      // Track open/close for non-void elements
      if (!tagContent.startsWith('/') && !tagContent.endsWith('/')) {
        const tagName = tagContent.split(/[\s>]/)[0].toLowerCase()
        const voidEls = new Set(['br', 'hr', 'img', 'input', 'meta', 'link'])
        if (!voidEls.has(tagName)) openTags.push(tagName)
      } else if (tagContent.startsWith('/')) {
        const tagName = tagContent.slice(1).split(/[\s>]/)[0].toLowerCase()
        const lastIdx = openTags.lastIndexOf(tagName)
        if (lastIdx >= 0) openTags.splice(lastIdx, 1)
      }
      i = tagEnd + 1
    } else if (ch === '&') {
      // Entities count as one visible char; copy the whole entity
      const semi = html.indexOf(';', i)
      if (semi !== -1 && semi - i < 10) {
        result += html.slice(i, semi + 1)
        i = semi + 1
      } else {
        result += ch
        i++
      }
      visibleCount++
    } else {
      result += ch
      i++
      visibleCount++
    }
  }

  // Close any unclosed tags
  for (let j = openTags.length - 1; j >= 0; j--) {
    result += `</${openTags[j]}>`
  }
  return result
}
