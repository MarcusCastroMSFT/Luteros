import { Suspense } from 'react'
import { Metadata } from 'next'
import { getProducts } from '@/lib/products-server'
import { ProductsPageClient } from './products-page-client'
import { ProductListSkeleton } from '@/components/products/productListSkeleton'
import { PageHeader } from '@/components/common/pageHeader'

const PRODUCTS_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Descontos especiais em produtos e serviços selecionados para mães, pais e famílias. Membros têm acesso a ofertas exclusivas!',
  keywords: ['produtos', 'descontos', 'ofertas', 'família', 'saúde', 'bem-estar'],
  openGraph: {
    title: 'Produtos | lutteros',
    description: 'Descontos especiais em produtos e serviços selecionados para mães, pais e famílias.',
    type: 'website',
  },
  twitter: {
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

async function ProductsContent({
  page,
  search,
  category,
  availability,
  featured,
}: {
  page: number
  search: string
  category: string
  availability: string
  featured: boolean
}) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductListSkeleton />
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const search = sp.search ?? ''
  const category = sp.category ?? ''
  const availability = sp.availability ?? ''
  const featured = sp.featured === 'true'

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Produtos"
        description="Descontos especiais em produtos e serviços selecionados para mães, pais e famílias. Membros têm acesso a ofertas exclusivas!"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Produtos' }
        ]}
      />

      <Suspense
        key={`${page}-${search}-${category}-${availability}-${featured}`}
        fallback={<ProductsPageFallback />}
      >
        <ProductsContent
          page={page}
          search={search}
          category={category}
          availability={availability}
          featured={featured}
        />
      </Suspense>
    </div>
  )
}
