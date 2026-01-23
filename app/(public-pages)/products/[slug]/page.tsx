import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductMetadata, getRelatedProducts, getAllProductSlugs } from '@/lib/products'
import { ProductDetailClient } from './product-detail-client'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all products (SSG)
// New products are accessible immediately via cache revalidation on creation
export async function generateStaticParams() {
  return getAllProductSlugs()
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const metadata = await getProductMetadata(slug)
  
  if (!metadata) {
    return {
      title: 'Produto não encontrado',
    }
  }

  return {
    title: `${metadata.title} | lutteros`,
    description: metadata.description || `Desconto exclusivo em ${metadata.title}`,
    keywords: [
      metadata.category.toLowerCase(),
      'desconto exclusivo',
      'cupom de desconto',
      metadata.partnerName.toLowerCase(),
    ],
    openGraph: {
      title: `${metadata.title} | lutteros`,
      description: metadata.description || `Desconto exclusivo em ${metadata.title}`,
      type: 'website',
      locale: 'pt_BR',
      ...(metadata.image && { images: [metadata.image] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metadata.title} | lutteros`,
      description: metadata.description || `Desconto exclusivo em ${metadata.title}`,
      ...(metadata.image && { images: [metadata.image] }),
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  // Fetch product data on the server using direct database access
  const product = await getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.id, product.category)

  // Pass the data to the client component for interactivity
  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
