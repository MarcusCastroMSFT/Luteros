import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductMetadata, getRelatedProducts } from '@/lib/products'
import { ProductDetailClient } from './product-detail-client'
import { JsonLd } from '@/components/seo/json-ld'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.lutteros.com.br'
  const productUrl = `${baseUrl}/products/${product.slug}`

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image,
    url: productUrl,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: product.partner.name,
      ...(product.partner.logo && { logo: product.partner.logo }),
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BRL',
      price: product.discount.discountedPrice ?? 0,
      availability: product.isActive
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(product.validUntil && { priceValidUntil: product.validUntil }),
      seller: {
        '@type': 'Organization',
        name: product.partner.name,
        ...(product.partner.website && { url: product.partner.website }),
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Produtos', item: `${baseUrl}/products` },
      { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
    ],
  }

  // Pass the data to the client component for interactivity
  return (
    <>
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  )
}
