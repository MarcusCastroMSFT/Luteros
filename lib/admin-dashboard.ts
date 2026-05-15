import 'server-only'
import { and, desc, eq, gt, gte, isNull, lt, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  blogArticles,
  communityReports,
  enrollments,
  eventRegistrations,
  events,
  subscriptionPlans,
  users,
  userSubscriptions,
} from '@/lib/db/schema'

export interface AdminOverview {
  mrr: {
    current: number
    previousMonth: number
    deltaPercent: number | null
    currency: string
  }
  subscribers: {
    total: number
    byPlan: Array<{ planName: string; audience: 'general' | 'doctors'; count: number; price: number }>
    newThisMonth: number
    newPrevMonth: number
  }
  users: {
    total: number
    newLast30d: number
    newPrev30d: number
    activeLast7d: number
    conversionRate: number // active subscribers / total users
  }
  churn: {
    cancelledLast30d: number
    activeAtPeriodStart: number
    churnRatePercent: number | null
  }
  topArticles: Array<{
    id: string
    slug: string
    title: string
    category: string
    viewCount: number
    commentCount: number
    likeCount: number
    isPublished: boolean
    accessType: string
  }>
  upcomingEvents: Array<{
    id: string
    slug: string
    title: string
    eventDate: Date
    location: string
    totalSlots: number
    bookedSlots: number
    isFree: boolean
  }>
  moderationQueue: {
    pendingCount: number
  }
  recentSubscriptions: Array<{
    id: string
    userName: string | null
    userEmail: string | null
    planName: string
    audience: 'general' | 'doctors'
    startsAt: Date
  }>
  contentCounts: {
    publishedArticles: number
    draftArticles: number
    publishedCourses: number
    upcomingEvents: number
  }
}

/**
 * Aggregates every metric the admin overview page needs in one round of
 * parallel queries. Designed to be called from a server component.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const prev30dStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Subscription is "active" when status is ACTIVE/TRIAL and not expired
  const isActiveSub = and(
    or(eq(userSubscriptions.status, 'ACTIVE'), eq(userSubscriptions.status, 'TRIAL')),
    or(isNull(userSubscriptions.endsAt), gt(userSubscriptions.endsAt, now)),
  )

  const [
    subStats,
    subsByPlan,
    [userStats],
    churnLast30d,
    subsAtMonthStart,
    topArticlesRows,
    upcomingEventsRows,
    [{ moderationPending }],
    recentSubsRows,
    [contentCounts],
  ] = await Promise.all([
    // Subscriber + MRR aggregates in one shot
    db
      .select({
        activeCount: sql<number>`count(*) filter (where ${userSubscriptions.status} in ('ACTIVE','TRIAL') and (${userSubscriptions.endsAt} is null or ${userSubscriptions.endsAt} > ${now}))::int`,
        mrrCurrent: sql<number>`coalesce(sum(${subscriptionPlans.price}) filter (where ${userSubscriptions.status} = 'ACTIVE' and (${userSubscriptions.endsAt} is null or ${userSubscriptions.endsAt} > ${now})), 0)::float`,
        mrrPrevMonth: sql<number>`coalesce(sum(${subscriptionPlans.price}) filter (where ${userSubscriptions.status} = 'ACTIVE' and ${userSubscriptions.startsAt} < ${startOfMonth} and (${userSubscriptions.endsAt} is null or ${userSubscriptions.endsAt} > ${startOfPrevMonth})), 0)::float`,
        newThisMonth: sql<number>`count(*) filter (where ${userSubscriptions.startsAt} >= ${startOfMonth})::int`,
        newPrevMonth: sql<number>`count(*) filter (where ${userSubscriptions.startsAt} >= ${startOfPrevMonth} and ${userSubscriptions.startsAt} < ${startOfMonth})::int`,
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id)),

    // Active subscribers grouped by plan (for the split display)
    db
      .select({
        planName: subscriptionPlans.name,
        audience: subscriptionPlans.audience,
        price: subscriptionPlans.price,
        count: sql<number>`count(*)::int`,
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(isActiveSub)
      .groupBy(subscriptionPlans.id, subscriptionPlans.name, subscriptionPlans.audience, subscriptionPlans.price)
      .orderBy(desc(subscriptionPlans.audience)),

    // Users in a single query with filter clauses
    db
      .select({
        total: sql<number>`count(*)::int`,
        newLast30d: sql<number>`count(*) filter (where ${users.createdAt} >= ${last30d})::int`,
        newPrev30d: sql<number>`count(*) filter (where ${users.createdAt} >= ${prev30dStart} and ${users.createdAt} < ${last30d})::int`,
        activeLast7d: sql<number>`count(*) filter (where ${users.lastLoginAt} >= ${last7d})::int`,
      })
      .from(users),

    // Subscriptions cancelled in last 30d
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userSubscriptions)
      .where(and(eq(userSubscriptions.status, 'CANCELLED'), gte(userSubscriptions.cancelledAt, last30d))),

    // Active subscribers at start of last-30d window (denominator for churn)
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userSubscriptions)
      .where(
        and(
          lt(userSubscriptions.startsAt, last30d),
          or(isNull(userSubscriptions.cancelledAt), gt(userSubscriptions.cancelledAt, last30d)),
        ),
      ),

    // Top articles overall (by views, then comments). Limit to published.
    db
      .select({
        id: blogArticles.id,
        slug: blogArticles.slug,
        title: blogArticles.title,
        category: blogArticles.category,
        viewCount: blogArticles.viewCount,
        commentCount: blogArticles.commentCount,
        likeCount: blogArticles.likeCount,
        isPublished: blogArticles.isPublished,
        accessType: blogArticles.accessType,
      })
      .from(blogArticles)
      .where(eq(blogArticles.isPublished, true))
      .orderBy(desc(blogArticles.viewCount), desc(blogArticles.commentCount))
      .limit(5),

    // Upcoming events with seat-fill (correlated subquery is fine here — at most 5 rows)
    db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
        eventDate: events.eventDate,
        location: events.location,
        totalSlots: events.totalSlots,
        bookedSlots: sql<number>`(SELECT count(*)::int FROM "event_registrations" er WHERE er."eventId" = ${events.id})`,
        isFree: events.isFree,
      })
      .from(events)
      .where(and(eq(events.isPublished, true), eq(events.isCancelled, false), gte(events.eventDate, now)))
      .orderBy(events.eventDate)
      .limit(5),

    // Moderation queue size
    db
      .select({ moderationPending: sql<number>`count(*)::int` })
      .from(communityReports)
      .where(eq(communityReports.status, 'PENDING')),

    // Latest subscriptions for the activity panel
    db
      .select({
        id: userSubscriptions.id,
        userName: users.name,
        userDisplayName: users.displayName,
        userEmail: users.email,
        planName: subscriptionPlans.name,
        audience: subscriptionPlans.audience,
        startsAt: userSubscriptions.startsAt,
      })
      .from(userSubscriptions)
      .innerJoin(users, eq(userSubscriptions.userId, users.id))
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(isActiveSub)
      .orderBy(desc(userSubscriptions.startsAt))
      .limit(5),

    // Article publish/draft counts in one query
    db
      .select({
        publishedArticles: sql<number>`count(*) filter (where ${blogArticles.isPublished} = true)::int`,
        draftArticles: sql<number>`count(*) filter (where ${blogArticles.isPublished} = false)::int`,
      })
      .from(blogArticles),
  ])

  // Course + upcoming-event counts via tiny side queries (parallel with the rest)
  // — done here because Drizzle's TypeScript inference balks at sql-from-subquery
  const [[{ publishedCoursesCount }], [{ upcomingEventsCount }]] = await Promise.all([
    db.execute(sql<{ publishedCoursesCount: number }[]>`select count(*)::int as "publishedCoursesCount" from "courses" where "isPublished" = true`).then((r) => (r as unknown as { publishedCoursesCount: number }[])),
    db.execute(sql<{ upcomingEventsCount: number }[]>`select count(*)::int as "upcomingEventsCount" from "events" where "isPublished" = true and "isCancelled" = false and "eventDate" >= ${now}`).then((r) => (r as unknown as { upcomingEventsCount: number }[])),
  ])

  const stats = subStats[0] ?? { activeCount: 0, mrrCurrent: 0, mrrPrevMonth: 0, newThisMonth: 0, newPrevMonth: 0 }
  const mrrDelta = stats.mrrPrevMonth > 0 ? ((stats.mrrCurrent - stats.mrrPrevMonth) / stats.mrrPrevMonth) * 100 : null

  const cancelled = Number(churnLast30d[0]?.count ?? 0)
  const activeAtStart = Number(subsAtMonthStart[0]?.count ?? 0)
  const churnRate = activeAtStart > 0 ? (cancelled / activeAtStart) * 100 : null

  const conversionRate = userStats.total > 0 ? (Number(stats.activeCount) / userStats.total) * 100 : 0

  // Used `enrollments` and `eventRegistrations` imports above only via raw SQL/queries; keep them referenced for tree-shake safety
  void enrollments
  void eventRegistrations

  return {
    mrr: {
      current: Number(stats.mrrCurrent),
      previousMonth: Number(stats.mrrPrevMonth),
      deltaPercent: mrrDelta,
      currency: 'BRL',
    },
    subscribers: {
      total: Number(stats.activeCount),
      byPlan: subsByPlan.map((p) => ({
        planName: p.planName,
        audience: p.audience as 'general' | 'doctors',
        count: Number(p.count),
        price: Number(p.price),
      })),
      newThisMonth: Number(stats.newThisMonth),
      newPrevMonth: Number(stats.newPrevMonth),
    },
    users: {
      total: Number(userStats.total),
      newLast30d: Number(userStats.newLast30d),
      newPrev30d: Number(userStats.newPrev30d),
      activeLast7d: Number(userStats.activeLast7d),
      conversionRate,
    },
    churn: {
      cancelledLast30d: cancelled,
      activeAtPeriodStart: activeAtStart,
      churnRatePercent: churnRate,
    },
    topArticles: topArticlesRows.map((a) => ({
      ...a,
      viewCount: Number(a.viewCount),
      commentCount: Number(a.commentCount),
      likeCount: Number(a.likeCount),
    })),
    upcomingEvents: upcomingEventsRows.map((e) => ({
      ...e,
      totalSlots: Number(e.totalSlots),
      bookedSlots: Number(e.bookedSlots),
    })),
    moderationQueue: {
      pendingCount: Number(moderationPending ?? 0),
    },
    recentSubscriptions: recentSubsRows.map((s) => ({
      id: s.id,
      userName: s.userDisplayName || s.userName,
      userEmail: s.userEmail,
      planName: s.planName,
      audience: s.audience as 'general' | 'doctors',
      startsAt: s.startsAt,
    })),
    contentCounts: {
      publishedArticles: Number(contentCounts.publishedArticles),
      draftArticles: Number(contentCounts.draftArticles),
      publishedCourses: Number(publishedCoursesCount),
      upcomingEvents: Number(upcomingEventsCount),
    },
  }
}
