import { ProductDetailSkeleton } from '@/components/products/productDetailSkeleton'

// Gives this page (which reads `params` at request time) its own <Suspense>.
export default function Loading() {
  return <ProductDetailSkeleton />
}
