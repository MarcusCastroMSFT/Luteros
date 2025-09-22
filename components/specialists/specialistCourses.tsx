import React from 'react';
import { Course } from '@/types/course';
import { CourseList } from '@/components/courses/courseList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpecialistCoursesProps {
  courses: Course[];
}

export function SpecialistCourses({ courses }: SpecialistCoursesProps) {
  return (
    <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</CardTitle>
        <p className="text-gray-600 dark:text-gray-300">
          Explore my comprehensive course collection designed to help you master essential skills.
        </p>
      </CardHeader>
      <CardContent>
        <CourseList 
          courses={courses} 
          limit={6}
          showInstructor={false}
        />
      </CardContent>
    </Card>
  );
}
