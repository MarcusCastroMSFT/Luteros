export interface Instructor {
  id: string;
  name: string;
  slug: string;
  title: string;
  bio: string;
  image: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  coursesCount: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'audio';
  duration: string; // e.g., "15:30" for 15 minutes 30 seconds
  isPreview?: boolean;
  order: number;
  videoUrl?: string; // Optional video URL for video lessons
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
  totalDuration: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  video?: string; // YouTube video URL or ID
  instructor: Instructor;
  price: number;
  originalPrice?: number;
  lessonsCount: number;
  sectionsCount: number;
  duration: string; // e.g., "16 hours"
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  category: string;
  status?: 'Ativo' | 'Rascunho' | 'Inativo';
  isBestSeller?: boolean;
  tags: string[];
  sections: CourseSection[];
  lastUpdated: string;
  language: string;
  includes: string[];
  learningObjectives?: string[];
  requirements?: string[];
  aboutCourse?: string;
}

export interface CoursesPagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  coursesPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CoursesApiResponse {
  success: boolean;
  data: {
    courses: Course[];
    pagination: CoursesPagination;
    categories: string[];
  } | null;
  error?: string;
}

export interface CourseApiResponse {
  success: boolean;
  data: {
    course: Course;
    relatedCourses: Course[];
  } | null;
  error?: string;
}

export interface CourseCardProps {
  course: Course;
  className?: string;
  showInstructor?: boolean;
}

export interface CourseListProps {
  courses?: Course[];
  limit?: number;
  className?: string;
}
