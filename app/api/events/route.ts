import { NextRequest, NextResponse } from 'next/server'
import { sampleEvents } from '@/data/events'

export interface Event {
  id: number
  header: string
  type: string
  status: "Active" | "Inactive" | "Pending"
  location: string
  date: string
  time: string
  paid: "Free" | "Paid"
  target: string
  limit: string
  reviewer: string
}

// Function to determine event type from title
function getEventType(title: string): string {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('conferência')) return 'Conferência'
  if (titleLower.includes('cúpula')) return 'Cúpula'
  if (titleLower.includes('workshop')) return 'Workshop'
  if (titleLower.includes('seminário')) return 'Seminário'
  if (titleLower.includes('simpósio')) return 'Simpósio'
  if (titleLower.includes('fórum')) return 'Fórum'
  if (titleLower.includes('congresso')) return 'Congresso'
  if (titleLower.includes('encontro')) return 'Encontro'
  if (titleLower.includes('mesa redonda')) return 'Mesa Redonda'
  if (titleLower.includes('palestra')) return 'Palestra'
  return 'Evento'
}

// Function to determine status based on booking percentage
function getEventStatus(bookedSlots: number, totalSlots: number): "Active" | "Inactive" | "Pending" {
  const percentage = (bookedSlots / totalSlots) * 100
  if (percentage === 0) return 'Pending'
  if (percentage >= 80) return 'Active'
  return 'Active' // Most events are active if they have some bookings
}

// Function to get reviewer from speakers (use first speaker's name)
function getReviewer(speakers: { name: string }[]): string {
  if (speakers && speakers.length > 0) {
    return speakers[0].name || 'Não Atribuído'
  }
  return 'Não Atribuído'
}

// Function to determine if event is paid or free
function getEventPaidStatus(cost: string): "Free" | "Paid" {
  // Check if cost is "Gratuito", "Free", or contains "R$0" or similar
  const costLower = cost.toLowerCase()
  if (costLower.includes('gratuito') || costLower.includes('free') || cost === 'R$0' || cost === '0') {
    return 'Free'
  }
  return 'Paid'
}

// Convert sampleEvents to the Event interface expected by the table
const mockEvents: Event[] = sampleEvents.map((event) => ({
  id: parseInt(event.id),
  header: event.title,
  type: getEventType(event.title),
  status: getEventStatus(event.bookedSlots, event.totalSlots),
  location: event.location,
  date: event.date,
  time: event.time,
  paid: getEventPaidStatus(event.cost),
  target: event.bookedSlots.toString(),
  limit: event.totalSlots.toString(),
  reviewer: getReviewer(event.speakers)
}))

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || ''
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Filter data based on search
    let filteredEvents = mockEvents
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredEvents = mockEvents.filter(event =>
        event.header.toLowerCase().includes(searchLower) ||
        event.type.toLowerCase().includes(searchLower) ||
        event.status.toLowerCase().includes(searchLower) ||
        event.reviewer.toLowerCase().includes(searchLower)
      )
    }

    // Sort data
    if (sortBy) {
      filteredEvents.sort((a, b) => {
        const aValue = a[sortBy as keyof Event]
        const bValue = b[sortBy as keyof Event]
        
        // Handle numeric fields
        if (sortBy === 'id') {
          const numA = parseInt(aValue as string)
          const numB = parseInt(bValue as string)
          return sortOrder === 'asc' ? numA - numB : numB - numA
        }
        
        // Handle string fields
        const strA = String(aValue).toLowerCase()
        const strB = String(bValue).toLowerCase()
        
        if (sortOrder === 'asc') {
          return strA.localeCompare(strB)
        } else {
          return strB.localeCompare(strA)
        }
      })
    }

    // Calculate pagination
    const totalItems = filteredEvents.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

    // Simulate network delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 100))

    return NextResponse.json({
      data: paginatedEvents,
      totalCount: totalItems,
      pageCount: totalPages,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
