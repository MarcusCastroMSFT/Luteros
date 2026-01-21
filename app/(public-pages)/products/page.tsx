import { Suspense } from 'react'
import { getInitialProducts } from '@/lib/products-server'
import { ProductsPageClient } from './products-page-client'
import { ProductListSkeleton } from '@/components/products/productListSkeleton'

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsContent />
    </Suspense>
  )
}

// Fallback component while loading
function ProductsPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Produtos e Descontos Exclusivos
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descontos especiais em produtos e serviços selecionados para mães, pais e famílias. 
              Membros têm acesso a ofertas exclusivas!
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductListSkeleton />
      </div>
    </div>
  )
}
