import { Suspense } from 'react'
import { Metadata } from 'next'
import { getCourses } from '@/lib/courses'
import { CoursesPageClient } from './courses-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { CourseListSkeleton } from '@/components/courses/courseSkeleton'
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton'

const COURSES_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis. Aprenda com especialistas.',
  keywords: ['cursos', 'educação sexual', 'saúde reprodutiva', 'relacionamentos', 'educação online'],
  openGraph: {
    title: 'Cursos | lutteros',
    description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cursos | lutteros',
    description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis.',
  },
  alternates: {
    canonical: '/courses',
  },
}

interface CoursesPageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

async function CoursesContent({ page, category }: { page: number; category: string }) {
  const data = await getCourses(page, COURSES_PER_PAGE, category === 'Todos' ? undefined : category)

  return (
    <CoursesPageClient
      courses={data.courses}
      pagination={data.pagination}
      categories={data.categories}
      activeCategory={category}
    />
  )
}

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

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const category = sp.category ?? 'Todos'

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
        <Suspense key={`${page}-${category}`} fallback={<CoursesPageFallback />}>
          <CoursesContent page={page} category={category} />
        </Suspense>
      </div>
    </div>
  )
}
