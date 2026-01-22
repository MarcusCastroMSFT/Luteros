import { Suspense } from 'react'
import { Metadata } from 'next'
import { getInitialCourses } from '@/lib/courses'
import { CoursesPageClient } from './courses-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { CourseListSkeleton } from '@/components/courses/courseSkeleton'
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton'

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis. Aprenda com especialistas.',
  keywords: ['cursos', 'educação sexual', 'saúde reprodutiva', 'relacionamentos', 'educação online'],
  openGraph: {
    title: 'Cursos | Luteros',
    description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cursos | Luteros',
    description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis.',
  },
  alternates: {
    canonical: '/courses',
  },
}

// Server Component for initial data fetching
async function CoursesContent() {
  const initialData = await getInitialCourses()
  
  return (
    <CoursesPageClient 
      initialCourses={initialData.courses}
      initialPagination={initialData.pagination}
      initialCategories={initialData.categories}
    />
  )
}

// Fallback component while loading
function CoursesPageFallback() {
  return (
    <>
      <div className="flex justify-center mb-12">
        <CategoryFilterSkeleton />
      </div>
      <CourseListSkeleton count={12} />
    </>
  )
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Cursos"
        description="Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cursos' }
        ]}
      />
      
      <div className="container mx-auto px-4 max-w-[1428px] py-16">
        <Suspense fallback={<CoursesPageFallback />}>
          <CoursesContent />
        </Suspense>
      </div>
    </div>
  )
}