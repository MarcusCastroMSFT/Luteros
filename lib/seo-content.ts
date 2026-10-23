import { and, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogArticles, courses, events } from '@/lib/db/schema'

// Published content used by the machine-readable endpoints (RSS, llms.txt, llms-full.txt).
// Callers must opt into request-time rendering (`await connection()`).

export async function getFeedArticles(limit?: number) {
  const query = db
    .select({
      slug: blogArticles.slug,
      title: blogArticles.title,
      excerpt: blogArticles.excerpt,
      metaDescription: blogArticles.metaDescription,
      category: blogArticles.category,
      accessType: blogArticles.accessType,
      publishedAt: blogArticles.publishedAt,
      updatedAt: blogArticles.updatedAt,
      createdAt: blogArticles.createdAt,
    })
    .from(blogArticles)
    .where(eq(blogArticles.isPublished, true))
    .orderBy(desc(blogArticles.publishedAt))
  return limit ? query.limit(limit) : query
}

// Full text is only ever returned for free articles; paid content stays behind the paywall.
export async function getFreeArticlesWithContent() {
  return db
    .select({
      slug: blogArticles.slug,
      title: blogArticles.title,
      excerpt: blogArticles.excerpt,
      content: blogArticles.content,
      category: blogArticles.category,
      publishedAt: blogArticles.publishedAt,
      updatedAt: blogArticles.updatedAt,
    })
    .from(blogArticles)
    .where(and(eq(blogArticles.isPublished, true), eq(blogArticles.accessType, 'free')))
    .orderBy(desc(blogArticles.publishedAt))
}

export async function getFeedCourses() {
  return db
    .select({
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      shortDescription: courses.shortDescription,
    })
    .from(courses)
    .where(eq(courses.isPublished, true))
}

export async function getUpcomingEvents() {
  return db
    .select({
      slug: events.slug,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
    })
    .from(events)
    .where(and(eq(events.isPublished, true), eq(events.isCancelled, false), gte(events.eventDate, new Date())))
    .orderBy(events.eventDate)
}
