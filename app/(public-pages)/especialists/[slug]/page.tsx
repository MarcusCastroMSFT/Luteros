import React from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { SpecialistContact } from '@/components/specialists/specialistContact';
import { SpecialistAbout } from '@/components/specialists/specialistAbout';
import { SpecialistCourses } from '@/components/specialists/specialistCourses';
import { sampleSpecialists } from '@/data/specialists';
import { sampleCourses } from '@/data/courses';
import { notFound } from 'next/navigation';
import { Specialist } from '@/types/specialist';
import { Course } from '@/types/course';

interface SpecialistPageProps {
  params: {
    username: string;
  };
}

export default function SpecialistPage({ params }: SpecialistPageProps) {
  const specialist = sampleSpecialists.find((s: Specialist) => s.slug === params.username);
  
  if (!specialist) {
    notFound();
  }

  // Filter courses by instructor (in a real app, this would be a proper relationship)
  const specialistCourses = sampleCourses.filter((course: Course) => 
    course.instructor.name.toLowerCase().includes(specialist.name.toLowerCase().split(' ')[0])
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title={specialist.name}
        description={`${specialist.profession} • ${specialist.studentsCount} students • ${specialist.coursesCount} courses`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Specialists', href: '/specialists' },
          { label: specialist.name }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <SpecialistAbout specialist={specialist} />
            <SpecialistCourses 
              courses={specialistCourses} 
            />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SpecialistContact specialist={specialist} />
          </div>
        </div>
      </div>
    </div>
  );
}
