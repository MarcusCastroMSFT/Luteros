import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourseBySlug, getCourseMetadata, getAllCourseSlugs } from '@/lib/courses';
import { CourseDetailClient } from './course-detail-client';
import { CourseDetailSkeleton } from '@/components/courses/courseDetailSkeleton';

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// JSON-LD structured data for Course schema
function generateCourseJsonLd(course: Awaited<ReturnType<typeof getCourseBySlug>>, slug: string) {
  if (!course) return null;
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lutteros.com.br';
  const courseUrl = `${baseUrl}/courses/${slug}`;
  const imageUrl = course.course.image?.startsWith('http') 
    ? course.course.image 
    : `${baseUrl}${course.course.image || course.course.coverImage}`;

  // Parse duration to ISO 8601 format (e.g., "PT5H30M")
  const parseDuration = (duration: string) => {
    const hoursMatch = duration.match(/(\d+)\s*h/);
    const minutesMatch = duration.match(/(\d+)\s*m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    if (hours && minutes) return `PT${hours}H${minutes}M`;
    if (hours) return `PT${hours}H`;
    if (minutes) return `PT${minutes}M`;
    return 'PT1H'; // Default
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.course.title,
    description: course.course.description,
    url: courseUrl,
    image: imageUrl,
    provider: {
      '@type': 'Organization',
      name: 'lutteros',
      url: baseUrl,
      logo: `${baseUrl}/images/logo.png`,
    },
    instructor: {
      '@type': 'Person',
      name: course.course.instructor.name,
      description: course.course.instructor.bio,
      image: course.course.instructor.image,
    },
    inLanguage: course.course.language || 'pt-BR',
    numberOfCredits: course.course.lessonsCount,
    educationalLevel: course.course.level,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: parseDuration(course.course.duration),
    },
    offers: {
      '@type': 'Offer',
      price: course.course.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: courseUrl,
    },
    aggregateRating: course.course.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: course.course.rating,
      reviewCount: course.course.reviewsCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    about: {
      '@type': 'Thing',
      name: course.course.category,
    },
  };
}

// Generate metadata for SEO with ISR support
export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = await getCourseMetadata(slug);
  
  if (!metadata) {
    return {
      title: 'Curso não encontrado',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lutteros.com.br';
  const courseUrl = `${baseUrl}/courses/${slug}`;
  const imageUrl = metadata.image?.startsWith('http') 
    ? metadata.image 
    : `${baseUrl}${metadata.image}`;
  
  return {
    title: `${metadata.title} | Cursos`,
    description: metadata.description,
    keywords: [metadata.category, 'curso online', 'educação', 'saúde sexual', 'bem-estar', metadata.level],
    authors: [{ name: metadata.instructorName }],
    alternates: {
      canonical: courseUrl,
    },
    openGraph: {
      title: `${metadata.title} | lutteros`,
      description: metadata.description || '',
      url: courseUrl,
      siteName: 'lutteros',
      images: metadata.image ? [{ 
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: metadata.title,
      }] : [],
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metadata.title} | lutteros`,
      description: metadata.description || '',
      images: metadata.image ? [imageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Server component to fetch course data
async function CourseContentWrapper({ slug }: { slug: string }) {
  const courseData = await getCourseBySlug(slug);
  
  if (!courseData) {
    notFound();
  }

  // Generate JSON-LD for SEO
  const jsonLd = generateCourseJsonLd(courseData, slug);
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CourseDetailClient course={courseData.course} lessons={courseData.lessons} slug={slug} />
    </>
  );
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseContentWrapper slug={slug} />
    </Suspense>
  );
}