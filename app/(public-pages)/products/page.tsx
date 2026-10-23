import { Suspense } from 'react'
import { Metadata } from 'next'
import { getProducts } from '@/lib/products-server'
import { ProductsPageClient } from './products-page-client'
import { ProductListSkeleton } from '@/components/products/productListSkeleton'
import { PageHeader } from '@/components/common/pageHeader'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images'

const PRODUCTS_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Descontos especiais em produtos e serviços selecionados para mães, pais e famílias. Membros têm acesso a ofertas exclusivas!',
  keywords: ['produtos', 'descontos', 'ofertas', 'família', 'saúde', 'bem-estar'],
  openGraph: {
    images: [DEFAULT_SOCIAL_IMAGE],
    title: 'Produtos | lutteros',
    description: 'Descontos especiais em produtos e serviços selecionados para mães, pais e famílias.',
    type: 'website',
  },
  twitter: {
    images: [DEFAULT_SOCIAL_IMAGE.url],
    card: 'summary_large_image',
    title: 'Produtos | lutteros',
    description: 'Descontos especiais em produtos e serviços selecionados para mães, pais e famílias.',
  },
  alternates: {
    canonical: '/products',
  },
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    availability?: string
    featured?: string
  }>
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  // Read the request params here, inside <Suspense>, so the page shell stays static.
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const search = sp.search ?? ''
  const category = sp.category ?? ''
  const availability = sp.availability ?? ''
  const featured = sp.featured === 'true'
  const data = await getProducts(page, PRODUCTS_PER_PAGE, {
    search: search || undefined,
    category: category || undefined,
    availability: availability || undefined,
    featured: featured || undefined,
  })

  return (
    <ProductsPageClient
      products={data.products}
      categories={data.categories}
      totalPages={data.totalPages}
      currentPage={page}
      activeFilters={{ search, category, availability, featured }}
    />
  )
}

function ProductsPageFallback() {
  return (
    <div className="mx-auto max-w-[1480px] px-6 py-6 sm:px-10 lg:px-12">
      <ProductListSkeleton />
    </div>
  )
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen">
      <PageHeader
        illustration="products"
        title="Produtos"
        description="Descontos especiais em produtos e serviços selecionados para mães, pais e famílias. Membros têm acesso a ofertas exclusivas!"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Produtos' }
        ]}
      />

      <Suspense fallback={<ProductsPageFallback />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
