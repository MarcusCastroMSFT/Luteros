import { and, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { courseAccessIps } from '@/lib/db/schema'
import {
  ACCESS_WINDOW_MS,
  evaluateIpAccess,
  parseMaxDistinctIps,
} from '@/lib/course-access-limit'

export interface PlaybackClient {
  ipAddress: string | null
  userAgent: string | null
}

// Records the requesting IP and reports whether it fits inside the account's IP budget.
export async function registerCourseAccess(
  userId: string,
  courseId: string,
  client: PlaybackClient,
  now: Date = new Date(),
): Promise<{ allowed: boolean }> {
  const maxDistinctIps = parseMaxDistinctIps(process.env.COURSE_ACCESS_MAX_IPS)
  if (maxDistinctIps === 0 || !client.ipAddress) return { allowed: true }

  const knownIps = await db
    .select({ ipAddress: courseAccessIps.ipAddress, lastSeenAt: courseAccessIps.lastSeenAt })
    .from(courseAccessIps)
    .where(and(
      eq(courseAccessIps.userId, userId),
      eq(courseAccessIps.courseId, courseId),
      gte(courseAccessIps.lastSeenAt, new Date(now.getTime() - ACCESS_WINDOW_MS)),
    ))

  const decision = evaluateIpAccess({ knownIps, currentIp: client.ipAddress, now, maxDistinctIps })
  if (!decision.allowed) return decision

  await db
    .insert(courseAccessIps)
    .values({
      userId,
      courseId,
      ipAddress: client.ipAddress,
      userAgent: client.userAgent?.slice(0, 300) ?? null,
      lastSeenAt: now,
    })
    .onConflictDoUpdate({
      target: [courseAccessIps.userId, courseAccessIps.courseId, courseAccessIps.ipAddress],
      set: { lastSeenAt: now },
    })

  return decision
}
