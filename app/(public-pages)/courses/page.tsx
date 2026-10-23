import { Suspense } from 'react'
import { Metadata } from 'next'
import { getCourses } from '@/lib/courses'
import { CoursesPageClient } from './courses-page-client'
import { PageHeader } from '@/components/common/pageHeader'
import { CourseListSkeleton } from '@/components/courses/courseSkeleton'
import { CategoryFilterSkeleton } from '@/components/blog/categoryFilterSkeleton'
import { CATALOG_PAGE_SIZE } from '@/lib/catalog-pagination'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images'

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis. Aprenda com especialistas.',
  keywords: ['cursos', 'educação sexual', 'saúde reprodutiva', 'relacionamentos', 'educação online'],
  openGraph: {
    images: [DEFAULT_SOCIAL_IMAGE],
    title: 'Cursos | lutteros',
    description: 'Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis.',
    type: 'website',
  },
  twitter: {
    images: [DEFAULT_SOCIAL_IMAGE.url],
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

async function CoursesContent({ searchParams }: CoursesPageProps) {
  // Read the request params here, inside <Suspense>, so the page shell stays static.
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const category = sp.category ?? 'Todos'
  const data = await getCourses(page, CATALOG_PAGE_SIZE, category === 'Todos' ? undefined : category)

  return (
    <CoursesPageClient
      key={`${category}-${page}`}
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
      <CourseListSkeleton count={CATALOG_PAGE_SIZE} />
    </>
  )
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  return (
    <div className="min-h-screen">
      <PageHeader
        illustration="courses"
        title="Cursos"
        description="Descubra nossos cursos especializados em educação sexual, saúde reprodutiva e relacionamentos saudáveis."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cursos' }
        ]}
      />

      <div className="mx-auto max-w-[1480px] px-6 pb-20 pt-6 sm:px-10 lg:px-12">
        <Suspense fallback={<CoursesPageFallback />}>
          <CoursesContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
