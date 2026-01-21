import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductMetadata, getRelatedProducts, getAllProductSlugs } from '@/lib/products'
import { ProductDetailClient } from './product-detail-client'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static paths for all products (SSG)
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs
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
    title: `${metadata.title} | Luteros`,
    description: metadata.description || `Desconto exclusivo em ${metadata.title}`,
    keywords: [
      metadata.category.toLowerCase(),
      'desconto exclusivo',
      'cupom de desconto',
      metadata.partnerName.toLowerCase(),
      'luteros',
      'produtos para família',
    ],
    openGraph: {
      title: `${metadata.title} - ${metadata.category} | Luteros`,
      description: metadata.description || `Desconto exclusivo em ${metadata.title}`,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Luteros',
      ...(metadata.image && { 
        images: [{
          url: metadata.image,
          width: 1200,
          height: 630,
          alt: metadata.title,
        }] 
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metadata.title} | Luteros`,
      description: metadata.description || `Desconto exclusivo em ${metadata.title}`,
      ...(metadata.image && { images: [metadata.image] }),
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// JSON-LD Structured Data for Product
function ProductJsonLd({ product }: { product: Awaited<ReturnType<typeof getProductBySlug>> }) {
  if (!product) return null
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luteros.com'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image,
    url: `${baseUrl}/products/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: product.partner.name,
      logo: product.partner.logo,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.discount.discountedPrice || 0,
      ...(product.discount.originalPrice && {
        priceValidUntil: product.validUntil,
      }),
      availability: product.isActive 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.partner.name,
        url: product.partner.website,
      },
    },
    category: product.category,
    ...(product.features.length > 0 && {
      additionalProperty: product.features.map(feature => ({
        '@type': 'PropertyValue',
        name: 'Feature',
        value: feature,
      })),
    }),
  }

  // Add discount information
  if (product.discount.originalPrice && product.discount.discountedPrice) {
    const discountJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: product.discount.discountedPrice,
        priceCurrency: 'BRL',
        valueAddedTaxIncluded: true,
      },
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
      },
    }
    
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(discountJsonLd) }}
        />
      </>
    )
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Breadcrumb JSON-LD
function BreadcrumbJsonLd({ product }: { product: Awaited<ReturnType<typeof getProductBySlug>> }) {
  if (!product) return null
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luteros.com'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produtos',
        item: `${baseUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${baseUrl}/products/${product.slug}`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
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
  return (
    <>
      {/* Structured Data for SEO */}
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd product={product} />
      
      {/* Main Content */}
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  )
}
