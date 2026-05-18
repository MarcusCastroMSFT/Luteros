import { cacheLife, cacheTag } from 'next/cache'
import { and, asc, eq, gte, ilike, ne, or, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { events, eventRegistrations, eventSpeakers } from '@/lib/db/schema'
import { type Event, type EventsPagination } from '@/types/event'
import { type Speaker } from '@/components/common/speakers'

// Transform DB event row to frontend Event type
function transformEvent(event: { id: string; slug: string; title: string; description: string | null; fullDescription: string | null; location: string; eventDate: Date; eventTime: string; duration: string | number | null; image: string | null; totalSlots: number; cost: string | null; isFree: boolean; createdAt: Date; bookedSlots: number }, speakers?: Speaker[]): Event {
  const baseEvent: Event = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description || '',
    fullDescription: event.fullDescription || '',
    location: event.location,
    date: event.eventDate.toISOString().split('T')[0],
    time: event.eventTime,
    cost: event.cost ? event.cost.toString() : '0',
    isFree: event.isFree,
    totalSlots: event.totalSlots,
    bookedSlots: event.bookedSlots,
    image: event.image || '',
  }
  if (speakers) baseEvent.speakers = speakers
  return baseEvent
}

async function fetchEvents(page: number, limit: number, search?: string) {
  const where = and(
    eq(events.isPublished, true),
    eq(events.isCancelled, false),
    search && search.trim() ? or(ilike(events.title, `%${search}%`), ilike(events.location, `%${search}%`), ilike(events.description, `%${search}%`), ilike(events.fullDescription, `%${search}%`)) : undefined,
  )

  const eventCols = {
    id: events.id, slug: events.slug, title: events.title, description: events.description,
    fullDescription: events.fullDescription, location: events.location, eventDate: events.eventDate,
    eventTime: events.eventTime, duration: events.duration, image: events.image,
    totalSlots: events.totalSlots, cost: events.cost, isFree: events.isFree, createdAt: events.createdAt,
    bookedSlots: sql<number>`(SELECT COUNT(*)::int FROM "event_registrations" er WHERE er."eventId" = ${events.id})`,
  }

  const [rows, [{ total }]] = await Promise.all([
    db.select(eventCols).from(events).where(where).orderBy(asc(events.eventDate)).offset((page - 1) * limit).limit(limit),
    db.select({ total: sql<number>`count(*)::int` }).from(events).where(where),
  ])

  const totalEvents = Number(total)
  const totalPages = Math.ceil(totalEvents / limit)

  return {
    events: rows.map((e) => transformEvent(e)),
    pagination: { currentPage: page, totalPages, totalEvents, eventsPerPage: limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 } as EventsPagination,
  }
}

// Get paginated events with optional search filter using Next.js 16 Cache Components
// Cached path (no search) — single tag so revalidateTag('events') covers all pages
async function getEventsCached(page: number, limit: number) {
  'use cache'
  cacheLife('hours') // event admin handlers call revalidateTag('events') on save; TTL is just a fallback
  cacheTag('events')

  return fetchEvents(page, limit)
}

export async function getEvents(page: number, limit: number, search?: string) {
  if (search) {
    return fetchEvents(page, limit, search)
  }
  return getEventsCached(page, limit)
}

async function fetchEventBySlug(slug: string) {
  const eventCols = {
    id: events.id, slug: events.slug, title: events.title, description: events.description,
    fullDescription: events.fullDescription, location: events.location, eventDate: events.eventDate,
    eventTime: events.eventTime, duration: events.duration, image: events.image,
    totalSlots: events.totalSlots, cost: events.cost, isFree: events.isFree, createdAt: events.createdAt,
    bookedSlots: sql<number>`(SELECT COUNT(*)::int FROM "event_registrations" er WHERE er."eventId" = ${events.id})`,
  }

  const event = await db.select(eventCols).from(events).where(and(eq(events.slug, slug), eq(events.isPublished, true), eq(events.isCancelled, false))).limit(1).then((r) => r[0] ?? null)
  if (!event) return null

  const [speakers, related] = await Promise.all([
    db.select({ id: eventSpeakers.id, name: eventSpeakers.name, title: eventSpeakers.title, bio: eventSpeakers.bio, image: eventSpeakers.image, linkedin: eventSpeakers.linkedin, twitter: eventSpeakers.twitter, website: eventSpeakers.website, order: eventSpeakers.order }).from(eventSpeakers).where(eq(eventSpeakers.eventId, event.id)).orderBy(asc(eventSpeakers.order)),
    db.select(eventCols).from(events).where(and(ne(events.slug, slug), eq(events.isPublished, true), eq(events.isCancelled, false), gte(events.eventDate, new Date()))).orderBy(asc(events.eventDate)).limit(3),
  ])

  return {
    event: transformEvent(event, speakers as Speaker[]),
    relatedEvents: related.map((e) => transformEvent(e)),
  }
}

// Get single event by slug with related events using Next.js 16 Cache Components
export async function getEventBySlug(slug: string) {
  'use cache'
  cacheLife('hours') // event admin handlers call revalidateTag('events') on save; TTL is just a fallback
  cacheTag('events', `event-${slug}`)
  
  return fetchEventBySlug(slug)
}

async function fetchEventMetadata(slug: string) {
  const row = await db.select({ title: events.title, description: events.description, image: events.image, location: events.location, eventDate: events.eventDate, eventTime: events.eventTime }).from(events).where(and(eq(events.slug, slug), eq(events.isPublished, true), eq(events.isCancelled, false))).limit(1).then((r) => r[0] ?? null)
  if (!row) return null
  return { title: row.title, description: row.description, image: row.image, location: row.location, date: row.eventDate?.toISOString(), time: row.eventTime }
}

// Get event metadata only (for generateMetadata) using Next.js 16 Cache Components
export async function getEventMetadata(slug: string) {
  'use cache'
  cacheLife('hours') // event admin handlers call revalidateTag('events') on save; TTL is just a fallback
  cacheTag('events', `event-${slug}`)
  
  return fetchEventMetadata(slug)
}

// Get upcoming events count (useful for homepage or navigation)
export async function getUpcomingEventsCount() {
  'use cache'
  cacheLife('hours') // event admin handlers call revalidateTag('events') on save; TTL is just a fallback
  cacheTag('events', 'upcoming-events-count')
  
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(events).where(and(eq(events.isPublished, true), eq(events.isCancelled, false), gte(events.eventDate, new Date())))
  return Number(count)
}

// Get all event slugs for generateStaticParams
export async function getAllEventSlugs() {
  'use cache'
  cacheLife('hours')
  cacheTag('events', 'event-slugs')
  
  const rows = await db.select({ slug: events.slug }).from(events).where(and(eq(events.isPublished, true), eq(events.isCancelled, false)))
  return rows.map((e) => ({ slug: e.slug }))
}

// Get initial events for SSR (first page)
export async function getInitialEvents() {
  'use cache'
  cacheLife('hours') // event admin handlers call revalidateTag('events') on save; TTL is just a fallback
  cacheTag('events', 'events-initial')

  return fetchEvents(1, 9) // First page with 9 events
}

// Server-side check whether the current authenticated user is registered for the given event.
// Used by /events/[slug] page to avoid a cascading client-side fetch on mount.
export async function isCurrentUserRegisteredForEvent(eventId: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false

  const row = await db
    .select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, session.user.id)))
    .limit(1)
    .then((r) => r[0] ?? null)

  return !!row
}
