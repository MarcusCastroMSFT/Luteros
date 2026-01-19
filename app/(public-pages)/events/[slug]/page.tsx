import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventBySlug, getEventMetadata } from '@/lib/events'
import { EventDetailClient } from './event-detail-client'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

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

  return {
    title: metadata.title,
    description: metadata.description || `Participe do evento ${metadata.title}${eventDate ? ` em ${eventDate}` : ''}`,
    openGraph: {
      title: metadata.title,
      description: metadata.description || `Participe do evento ${metadata.title}`,
      type: 'website',
      ...(metadata.image && { images: [metadata.image] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description || `Participe do evento ${metadata.title}`,
      ...(metadata.image && { images: [metadata.image] }),
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

  // Pass the data to the client component for interactivity
  return <EventDetailClient initialData={eventData} slug={slug} />
}
