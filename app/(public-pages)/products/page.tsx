import { Suspense } from 'react'
import { Metadata } from 'next'
import { getInitialProducts } from '@/lib/products-server'
import { ProductsPageClient } from './products-page-client'
import { ProductListSkeleton } from '@/components/products/productListSkeleton'
import { PageHeader } from '@/components/common/pageHeader'

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

// Server Component for initial data fetching
async function ProductsContent() {
  const initialData = await getInitialProducts()
  
  return (
    <ProductsPageClient 
      initialProducts={initialData.products}
      initialCategories={initialData.categories}
      initialTotalPages={initialData.totalPages}
    />
  )
}

// Fallback component while loading
function ProductsPageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductListSkeleton />
    </div>
  )
}

export default function ProductsPage() {
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
      
      <Suspense fallback={<ProductsPageFallback />}>
        <ProductsContent />
      </Suspense>
    </div>
  )
}
