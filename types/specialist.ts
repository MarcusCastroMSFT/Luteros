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
}
