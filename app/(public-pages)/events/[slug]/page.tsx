import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventBySlug, getEventMetadata, isCurrentUserRegisteredForEvent } from '@/lib/events'
import { EventDetailClient } from './event-detail-client'
import { JsonLd } from '@/components/seo/json-ld'

interface EventPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const metadata = await getEventMetadata(slug)
  
  if (!metadata) {
    return {
      title: 'Evento não encontrado',
    }
  }
  
  const eventDate = metadata.date 
    ? new Date(metadata.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : ''

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lutteros.com.br'
  const eventUrl = `${baseUrl}/events/${slug}`
  const description = metadata.description || `Participe do evento ${metadata.title}${eventDate ? ` em ${eventDate}` : ''}`
  const imageUrl = metadata.image
    ? metadata.image.startsWith('http') ? metadata.image : `${baseUrl}${metadata.image}`
    : undefined

  return {
    title: metadata.title,
    description,
    alternates: {
      canonical: eventUrl,
    },
    openGraph: {
      title: metadata.title,
      description,
      url: eventUrl,
      siteName: 'lutteros',
      type: 'website',
      locale: 'pt_BR',
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: metadata.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params

  // Fetch event data on the server using direct database access
  const eventData = await getEventBySlug(slug)
  if (!eventData) {
    notFound()
  }

  // SSR the registration status alongside the event so the client doesn't need
  // a follow-up fetch on mount.
  const initialIsRegistered = await isCurrentUserRegisteredForEvent(eventData.event.id)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lutteros.com.br'
  const ev = eventData.event
  const eventUrl = `${baseUrl}/events/${slug}`
  const imageUrl = ev.image
    ? ev.image.startsWith('http') ? ev.image : `${baseUrl}${ev.image}`
    : `${baseUrl}/images/og-image.png`
  // Build an ISO start date only when the time looks like HH:MM
  const startDate = /^\d{2}:\d{2}/.test(ev.time || '') ? `${ev.date}T${ev.time}:00` : ev.date
  const slotsAvailable = ev.totalSlots > 0 ? ev.bookedSlots < ev.totalSlots : true

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    description: ev.description || ev.fullDescription || `Evento ${ev.title}`,
    image: [imageUrl],
    startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: eventUrl,
    location: {
      '@type': 'Place',
      name: ev.location,
      address: ev.location,
    },
    organizer: {
      '@type': 'Organization',
      name: 'lutteros',
      url: baseUrl,
    },
    ...(ev.speakers?.length
      ? { performer: ev.speakers.map((s) => ({ '@type': 'Person', name: s.name })) }
      : {}),
    offers: {
      '@type': 'Offer',
      url: eventUrl,
      price: ev.isFree ? 0 : Number(ev.cost) || 0,
      priceCurrency: 'BRL',
      availability: slotsAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      validFrom: new Date().toISOString(),
    },
  }

  return (
    <>
      <JsonLd data={eventJsonLd} />
      <EventDetailClient
        initialData={eventData}
        initialIsRegistered={initialIsRegistered}
        slug={slug}
      />
    </>
  )
}
