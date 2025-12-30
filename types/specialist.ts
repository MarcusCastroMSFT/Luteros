export interface Specialist {
  id: string;
  slug: string;
  name: string;
  profession: string;
  avatar: string;
  studentsCount: number;
  coursesCount: number;
  rating: number;
  specialties: string[];
  bio: string;
  experience: string;
  // Future database fields
  fullBio?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  location?: string;
  email?: string;
  phone?: string;
  consultationPrice?: number;
  availableHours?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  achievements?: string[];
  publications?: string[];
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface SpecialistApiResponse {
  specialists: Specialist[];
  pagination: SpecialistPagination;
  specialties: string[];
  filters: {
    specialty: string;
    search: string;
  };
}

export interface SpecialistPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SpecialistFilters {
  specialty: string;
  search: string;
  page: number;
}
