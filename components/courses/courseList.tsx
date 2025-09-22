import React from 'react';
import { Course } from '@/types/course';
import { CourseCard } from './courseCard';

interface CourseListProps {
  courses: Course[];
  limit?: number;
  showInstructor?: boolean;
  className?: string;
}

export function CourseList({ 
  courses, 
  limit,
  showInstructor = true,
  className = ''
}: CourseListProps) {
  const displayedCourses = limit ? courses.slice(0, limit) : courses;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course}
            showInstructor={showInstructor}
          />
        ))}
      </div>
    </div>
  );
}
