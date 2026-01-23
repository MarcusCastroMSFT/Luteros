import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lutteros.com.br'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/specialists`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch all published blog articles
  let articlePages: MetadataRoute.Sitemap = []
  try {
    const articles = await prisma.blog_articles.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    })

    articlePages = articles.map((article: { slug: string; updatedAt: Date; publishedAt: Date | null }) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  // Fetch all published courses
  let coursePages: MetadataRoute.Sitemap = []
  try {
    const courses = await prisma.courses.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    coursePages = courses.map((course: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: course.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error)
  }

  // Fetch all published events
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const events = await prisma.events.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    eventPages = events.map((event: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
  }

  // Fetch all active products
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.products.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        isFeatured: true,
      },
    })

    productPages = products.map((product: { slug: string; updatedAt: Date; isFeatured: boolean }) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: product.isFeatured ? 0.8 : 0.6,
    }))
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  return [...staticPages, ...articlePages, ...coursePages, ...eventPages, ...productPages]
}
