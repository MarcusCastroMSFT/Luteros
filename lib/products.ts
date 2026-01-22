import { cacheLife, cacheTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { Product } from '@/types/product'

// Fetch product by slug directly from database
async function fetchProductBySlug(slug: string) {
  const product = await prisma.products.findUnique({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      shortDescription: true,
      image: true,
      discountPercentage: true,
      discountType: true,
      originalPrice: true,
      discountedPrice: true,
      discountAmount: true,
      promoCode: true,
      category: true,
      tags: true,
      availability: true,
      validUntil: true,
      termsAndConditions: true,
      howToUse: true,
      features: true,
      isActive: true,
      isFeatured: true,
      usageCount: true,
      maxUsages: true,
      createdAt: true,
      product_partners: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          website: true,
        },
      },
    },
  })

  if (!product) return null

  return transformProduct(product)
}

// Fetch related products
async function fetchRelatedProducts(productId: string, category: string) {
  const products = await prisma.products.findMany({
    where: {
      isActive: true,
      category,
      id: { not: productId },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      shortDescription: true,
      image: true,
      discountPercentage: true,
      discountType: true,
      originalPrice: true,
      discountedPrice: true,
      discountAmount: true,
      promoCode: true,
      category: true,
      tags: true,
      availability: true,
      validUntil: true,
      termsAndConditions: true,
      howToUse: true,
      features: true,
      isActive: true,
      isFeatured: true,
      usageCount: true,
      maxUsages: true,
      createdAt: true,
      product_partners: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          website: true,
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { usageCount: 'desc' },
    ],
    take: 4,
  })

  return products.map(transformProduct)
}

// Fetch metadata only (lightweight query for generateMetadata)
async function fetchProductMetadata(slug: string) {
  const product = await prisma.products.findUnique({
    where: {
      slug,
      isActive: true,
    },
    select: {
      title: true,
      shortDescription: true,
      description: true,
      image: true,
      category: true,
      product_partners: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!product) return null

  return {
    title: product.title,
    description: product.shortDescription || product.description,
    image: product.image,
    category: product.category,
    partnerName: product.product_partners.name,
  }
}

// Transform database product to frontend Product interface
type DatabaseProduct = {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string
  image: string | null
  discountPercentage: number
  discountType: string
  originalPrice: { toNumber(): number } | null
  discountedPrice: { toNumber(): number } | null
  discountAmount: { toNumber(): number } | null
  promoCode: string
  category: string
  tags: string[]
  availability: string
  validUntil: Date | null
  termsAndConditions: string | null
  howToUse: string[]
  features: string[]
  isActive: boolean
  isFeatured: boolean
  usageCount: number
  maxUsages: number | null
  createdAt: Date
  product_partners: {
    id: string
    name: string
    slug: string
    logo: string | null
    website: string | null
  }
}

function transformProduct(product: DatabaseProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    shortDescription: product.shortDescription,
    image: product.image || '',
    partner: {
      id: product.product_partners.id,
      name: product.product_partners.name,
      logo: product.product_partners.logo || '',
      website: product.product_partners.website || '',
    },
    discount: {
      percentage: product.discountPercentage,
      amount: product.discountAmount ? Number(product.discountAmount) : undefined,
      type: product.discountType as 'percentage' | 'fixed',
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : undefined,
    },
    promoCode: product.promoCode,
    category: product.category,
    tags: product.tags,
    availability: product.availability as 'all' | 'members',
    validUntil: product.validUntil?.toISOString().split('T')[0] || '',
    termsAndConditions: product.termsAndConditions || '',
    howToUse: product.howToUse,
    features: product.features,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    createdDate: product.createdAt.toISOString().split('T')[0],
    usageCount: product.usageCount,
    maxUsages: product.maxUsages || undefined,
  }
}

// Get product by slug with caching using Next.js 16 Cache Components
export async function getProductBySlug(slug: string) {
  'use cache'
  cacheLife('minutes') // Built-in profile: stale 5min, revalidate 1min, expire 1hr
  cacheTag('products', `product-${slug}`)
  
  return fetchProductBySlug(slug)
}

// Get related products with caching using Next.js 16 Cache Components
export async function getRelatedProducts(productId: string, category: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `related-products-${productId}`)
  
  return fetchRelatedProducts(productId, category)
}

// Get product metadata only (for generateMetadata) with caching
export async function getProductMetadata(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `product-${slug}`)
  
  return fetchProductMetadata(slug)
}

// Get all product slugs for generateStaticParams
export async function getAllProductSlugs() {
  'use cache'
  cacheLife('hours') // Cache slugs longer as they change less frequently
  cacheTag('products', 'product-slugs')
  
  const products = await prisma.products.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  
  return products.map((p: { slug: string }) => ({ slug: p.slug }))
}
