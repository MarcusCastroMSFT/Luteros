import { cacheLife, cacheTag } from 'next/cache'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { courseInstructors, courses, users } from '@/lib/db/schema'
import { bioLines, buildSpecialistLinks, slugify, type SpecialistLink } from '@/lib/specialist-profile'

export interface SpecialistCourse {
  slug: string
  title: string
  description: string
}

export interface Specialist {
  id: string
  slug: string
  name: string
  image: string | null
  title: string | null
  company: string | null
  credentials: string[]
  links: SpecialistLink[]
  courses: SpecialistCourse[]
  updatedAt: string
}

// Profiles without a bio stay listed but are not indexed or linked from search.
export function hasProfileContent(specialist: Pick<Specialist, 'credentials'>): boolean {
  return specialist.credentials.length > 0
}

async function fetchSpecialists(): Promise<Specialist[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      displayName: users.displayName,
      image: users.image,
      title: users.title,
      company: users.company,
      bio: users.bio,
      linkedin: users.linkedin,
      instagram: users.instagram,
      twitter: users.twitter,
      website: users.website,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.isSpecialist, true))
    .orderBy(asc(users.name))

  if (rows.length === 0) return []

  const taught = await db
    .select({
      instructorId: courseInstructors.instructorId,
      slug: courses.slug,
      title: courses.title,
      description: courses.shortDescription,
      fallbackDescription: courses.description,
    })
    .from(courseInstructors)
    .innerJoin(courses, eq(courses.id, courseInstructors.courseId))
    .where(and(inArray(courseInstructors.instructorId, rows.map((r) => r.id)), eq(courses.isPublished, true)))
    .orderBy(asc(courses.title))

  return rows.map((row) => {
    const name = (row.displayName || row.name || '').trim()
    return {
      id: row.id,
      slug: slugify(name),
      name,
      image: row.image?.trim() || null,
      title: row.title?.trim() || null,
      company: row.company?.trim() || null,
      credentials: bioLines(row.bio),
      links: buildSpecialistLinks(row),
      courses: taught
        .filter((c) => c.instructorId === row.id)
        .map((c) => ({ slug: c.slug, title: c.title, description: c.description || c.fallbackDescription })),
      updatedAt: row.updatedAt.toISOString(),
    }
  }).filter((s) => s.name && s.slug)
}

// Admin/profile handlers call revalidateTag('specialists') when a profile or the flag changes.
export async function getSpecialists(): Promise<Specialist[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('specialists')
  return fetchSpecialists()
}

export async function getSpecialistBySlug(slug: string): Promise<Specialist | null> {
  const all = await getSpecialists()
  return all.find((s) => s.slug === slug) ?? null
}
