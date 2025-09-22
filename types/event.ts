import { Speaker } from '@/components/common/speakers';

export interface Event {
  id: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  cost: string;
  totalSlots: number;
  bookedSlots: number;
  image: string;
  description?: string;
  fullDescription?: string;
  content?: string[];
  speakers?: Speaker[];
}

export interface EventsPagination {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  eventsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EventsApiResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination: EventsPagination;
  } | null;
  error?: string;
}

export interface EventApiResponse {
  success: boolean;
  data: {
    event: Event;
    relatedEvents: Event[];
  } | null;
  error?: string;
}

export interface EventCardProps {
  event: Event;
  className?: string;
}

export interface EventListProps {
  events?: Event[];
  limit?: number;
  className?: string;
}
