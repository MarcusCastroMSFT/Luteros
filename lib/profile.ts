import 'server-only'
import { eq, count, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  users,
  enrollments,
  eventRegistrations,
  blogBookmarks,
  certificates,
} from '@/lib/db/schema'
import type { UserProfileData } from '@/app/api/users/profile/route'

// Server-side equivalent of GET /api/users/profile. Use from page.tsx to SSR
// the profile instead of having the client fetch after mount.
export async function getCurrentUserProfile(): Promise<UserProfileData | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const userId = session.user.id

  const [profile, [enrollmentStats], [{ eventsCount }], [{ savedCount }], [{ certsCount }]] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0] ?? null),
    db
      .select({
        enrolledCount: count(),
        completedCount: sql<number>`count(*) filter (where ${enrollments.completedAt} is not null)::int`,
      })
      .from(enrollments)
      .where(eq(enrollments.userId, userId)),
    db.select({ eventsCount: count() }).from(eventRegistrations).where(eq(eventRegistrations.userId, userId)),
    db.select({ savedCount: count() }).from(blogBookmarks).where(eq(blogBookmarks.userId, userId)),
    db.select({ certsCount: count() }).from(certificates).where(eq(certificates.userId, userId)),
  ])

  if (!profile) return null

  return {
    id: profile.id,
    fullName: profile.name,
    displayName: profile.displayName,
    bio: profile.bio,
    avatar: profile.image,
    email: profile.email || '',
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth?.toISOString() || null,
    title: profile.title,
    company: profile.company,
    website: profile.website,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
    instagram: profile.instagram,
    language: profile.language,
    timezone: profile.timezone,
    emailNotifications: profile.emailNotifications,
    marketingEmails: profile.marketingEmails,
    createdAt: profile.createdAt.toISOString(),
    lastLoginAt: profile.lastLoginAt?.toISOString() || null,
    stats: {
      enrolledCourses: Number(enrollmentStats.enrolledCount),
      completedCourses: Number(enrollmentStats.completedCount),
      registeredEvents: Number(eventsCount),
      savedArticles: Number(savedCount),
      certificates: Number(certsCount),
    },
  }
}
