import { cacheLife, cacheTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { type Event, type EventsPagination } from '@/types/event'
import { type Speaker } from '@/components/common/speakers'

// Type for event with count from Prisma
type EventWithCount = {
  id: string
  slug: string
  title: string
  description: string | null
  fullDescription: string | null
  location: string
  eventDate: Date
  eventTime: string
  duration: string
  image: string | null
  totalSlots: number
  cost: { toString(): string } | null // Prisma Decimal type
  isFree: boolean
  createdAt: Date
  _count: {
    event_registrations: number
  }
}

// Type for event with speakers
type EventWithSpeakers = EventWithCount & {
  event_speakers: {
    id: string
    name: string
    title: string
    bio: string | null
    image: string | null
    linkedin: string | null
    twitter: string | null
    website: string | null
    order: number
  }[]
}

// Transform Prisma event to frontend Event type
function transformEvent(event: EventWithCount | EventWithSpeakers): Event {
  const bookedSlots = event._count.event_registrations
  
  const baseEvent: Event = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description || '',
    fullDescription: event.fullDescription || '',
    location: event.location,
    date: event.eventDate.toISOString().split('T')[0],
    time: event.eventTime,
    cost: event.cost ? event.cost.toString() : '0', // Convert Decimal to string
    isFree: event.isFree,
    totalSlots: event.totalSlots,
    bookedSlots,
    image: event.image || '',
  }

  // Add speakers if present
  if ('event_speakers' in event && event.event_speakers) {
    baseEvent.speakers = event.event_speakers as Speaker[]
  }

  return baseEvent
}

// Internal function to fetch events from database
async function fetchEvents(page: number, limit: number, search?: string) {
  // Build where clause for published events only
  const whereClause: Record<string, unknown> = {
    isPublished: true,
    isCancelled: false,
  }

  // Add search filter if provided
  if (search && search.trim()) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { fullDescription: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Get total count and paginated events in parallel
  const [totalEvents, events] = await Promise.all([
    prisma.events.count({ where: whereClause }),
    prisma.events.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        fullDescription: true,
        location: true,
        eventDate: true,
        eventTime: true,
        duration: true,
        image: true,
        totalSlots: true,
        cost: true,
        isFree: true,
        createdAt: true,
        _count: {
          select: {
            event_registrations: true,
          },
        },
      },
      orderBy: {
        eventDate: 'asc', // Upcoming events first
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const transformedEvents = events.map((event: EventWithCount) => transformEvent(event))

  // Calculate pagination
  const totalPages = Math.ceil(totalEvents / limit)

  return {
    events: transformedEvents,
    pagination: {
      currentPage: page,
      totalPages,
      totalEvents,
      eventsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    } as EventsPagination,
  }
}

// Get paginated events with optional search filter using Next.js 16 Cache Components
export async function getEvents(page: number, limit: number, search?: string) {
  'use cache'
  cacheLife('minutes') // Built-in profile: stale 5min, revalidate 1min, expire 1hr
  cacheTag('events', `events-list-${page}-${limit}-${search || 'all'}`)
  
  return fetchEvents(page, limit, search)
}

// Internal function to fetch single event
async function fetchEventBySlug(slug: string) {
  // Find event by slug (only published, non-cancelled events)
  const event = await prisma.events.findFirst({
    where: {
      slug,
      isPublished: true,
      isCancelled: false,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      fullDescription: true,
      location: true,
      eventDate: true,
      eventTime: true,
      duration: true,
      image: true,
      totalSlots: true,
      cost: true,
      isFree: true,
      createdAt: true,
      _count: {
        select: {
          event_registrations: true,
        },
      },
      event_speakers: {
        select: {
          id: true,
          name: true,
          title: true,
          bio: true,
          image: true,
          linkedin: true,
          twitter: true,
          website: true,
          order: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  if (!event) {
    return null
  }

  // Get related events (upcoming published events, excluding current event)
  const relatedEvents = await prisma.events.findMany({
    where: {
      slug: { not: slug },
      isPublished: true,
      isCancelled: false,
      eventDate: { gte: new Date() },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      fullDescription: true,
      location: true,
      eventDate: true,
      eventTime: true,
      duration: true,
      image: true,
      totalSlots: true,
      cost: true,
      isFree: true,
      createdAt: true,
      _count: {
        select: {
          event_registrations: true,
        },
      },
    },
    orderBy: {
      eventDate: 'asc',
    },
    take: 3,
  })

  return {
    event: transformEvent(event as EventWithSpeakers),
    relatedEvents: relatedEvents.map((e: EventWithCount) => transformEvent(e)),
  }
}

// Get single event by slug with related events using Next.js 16 Cache Components
export async function getEventBySlug(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('events', `event-${slug}`)
  
  return fetchEventBySlug(slug)
}

// Internal function to fetch event metadata
async function fetchEventMetadata(slug: string) {
  const event = await prisma.events.findFirst({
    where: { 
      slug,
      isPublished: true,
      isCancelled: false,
    },
    select: {
      title: true,
      description: true,
      image: true,
      location: true,
      eventDate: true,
      eventTime: true,
    },
  })

  if (!event) {
    return null
  }

  return {
    title: event.title,
    description: event.description,
    image: event.image,
    location: event.location,
    date: event.eventDate?.toISOString(),
    time: event.eventTime,
  }
}

// Get event metadata only (for generateMetadata) using Next.js 16 Cache Components
export async function getEventMetadata(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('events', `event-${slug}`)
  
  return fetchEventMetadata(slug)
}

// Get upcoming events count (useful for homepage or navigation)
export async function getUpcomingEventsCount() {
  'use cache'
  cacheLife('minutes')
  cacheTag('events', 'upcoming-events-count')
  
  return prisma.events.count({
    where: {
      isPublished: true,
      isCancelled: false,
      eventDate: { gte: new Date() },
    },
  })
}

// Get all event slugs for generateStaticParams
export async function getAllEventSlugs() {
  'use cache'
  cacheLife('hours') // Cache slugs longer as they change less frequently
  cacheTag('events', 'event-slugs')
  
  const events = await prisma.events.findMany({
    where: { 
      isPublished: true,
      isCancelled: false,
    },
    select: { slug: true },
  })
  
  return events.map((e: { slug: string }) => ({ slug: e.slug }))
}

// Get initial events for SSR (first page)
export async function getInitialEvents() {
  'use cache'
  cacheLife('minutes')
  cacheTag('events', 'events-initial')
  
  return fetchEvents(1, 9) // First page with 9 events
}
