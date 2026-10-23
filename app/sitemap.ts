import { MetadataRoute } from 'next'
import { connection } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { helpArticles } from '@/data/help'
import { blogArticles, courses, events, products } from '@/lib/db/schema'
import { SITE_URL } from '@/lib/seo'
import { getSpecialists, hasProfileContent } from '@/lib/specialists'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()

  const baseUrl = SITE_URL

  // Turn a stored image path (absolute URL or site-relative) into an absolute
  // URL so search engines can index it via the sitemap's <image:image> entries.
  const absoluteImage = (img?: string | null): string[] =>
    img ? [img.startsWith('http') ? img : `${baseUrl}${img}`] : []

  // Static pages
  // No lastModified here on purpose: a value that changes on every request teaches
  // crawlers to ignore it, which hurts the real lastmod of articles/courses/events.
  type Freq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  const staticRoutes: [path: string, changeFrequency: Freq, priority: number][] = [
    ['', 'daily', 1],
    ['/articles', 'daily', 0.9],
    ['/courses', 'weekly', 0.8],
    ['/events', 'weekly', 0.8],
    ['/about', 'monthly', 0.7],
    ['/specialists', 'weekly', 0.7],
    ['/products', 'weekly', 0.7],
    ['/community', 'weekly', 0.6],
    ['/faq', 'monthly', 0.5],
    ['/help', 'monthly', 0.5],
    ['/contact', 'yearly', 0.5],
    ['/waitlist', 'monthly', 0.5],
    ['/privacy', 'yearly', 0.3],
    ['/terms', 'yearly', 0.3],
    ...Object.keys(helpArticles).map((slug): [string, Freq, number] => [`/help/${slug}`, 'monthly', 0.4]),
  ]
  const staticPages: MetadataRoute.Sitemap = staticRoutes.map(([path, changeFrequency, priority]) => ({
    url: `${baseUrl}${path}`,
    changeFrequency,
    priority,
  }))

  // Specialist profiles without a bio are noindex, so they stay out of the sitemap too
  let specialistPages: MetadataRoute.Sitemap = []
  try {
    const specialists = await getSpecialists()
    specialistPages = specialists.filter(hasProfileContent).map((s) => ({
      url: `${baseUrl}/specialists/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      images: absoluteImage(s.image),
    }))
  } catch (error) {
    console.error('Error fetching specialists for sitemap:', error)
  }

  // Fetch all published blog articles
  let articlePages: MetadataRoute.Sitemap = []
  try {
    const articles = await db.select({ slug: blogArticles.slug, updatedAt: blogArticles.updatedAt, publishedAt: blogArticles.publishedAt, image: blogArticles.image, coverImage: blogArticles.coverImage }).from(blogArticles).where(eq(blogArticles.isPublished, true))

    articlePages = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: absoluteImage(article.coverImage || article.image),
    }))
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  // Fetch all published courses
  let coursePages: MetadataRoute.Sitemap = []
  try {
    const coursesRows = await db.select({ slug: courses.slug, updatedAt: courses.updatedAt, thumbnail: courses.thumbnail, coverImage: courses.coverImage }).from(courses).where(eq(courses.isPublished, true))

    coursePages = coursesRows.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: course.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      images: absoluteImage(course.coverImage || course.thumbnail),
    }))
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error)
  }

  // Fetch all published events
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const eventsRows = await db.select({ slug: events.slug, updatedAt: events.updatedAt, image: events.image }).from(events).where(eq(events.isPublished, true))

    eventPages = eventsRows.map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      images: absoluteImage(event.image),
    }))
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
  }

  // Fetch all active products
  let productPages: MetadataRoute.Sitemap = []
  try {
    const productsRows = await db.select({ slug: products.slug, updatedAt: products.updatedAt, isFeatured: products.isFeatured, image: products.image }).from(products).where(eq(products.isActive, true))

    productPages = productsRows.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: product.isFeatured ? 0.8 : 0.6,
      images: absoluteImage(product.image),
    }))
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  return [...staticPages, ...specialistPages, ...articlePages, ...coursePages, ...eventPages, ...productPages]
}
