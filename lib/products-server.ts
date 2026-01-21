import { cacheLife, cacheTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { Product, ProductCategory } from '@/types/product'

// Transform database product to frontend Product interface
function transformProduct(product: {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string
  image: string | null
  discountPercentage: number
  discountType: string
  originalPrice: { toNumber: () => number } | null
  discountedPrice: { toNumber: () => number } | null
  discountAmount: { toNumber: () => number } | null
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
  partner: {
    id: string
    name: string
    slug: string
    logo: string | null
    website: string | null
  }
}): Product {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    shortDescription: product.shortDescription,
    image: product.image || '',
    partner: {
      id: product.partner.id,
      name: product.partner.name,
      logo: product.partner.logo || '',
      website: product.partner.website || '',
    },
    discount: {
      percentage: product.discountPercentage,
      amount: product.discountAmount ? product.discountAmount.toNumber() : undefined,
      type: product.discountType as 'percentage' | 'fixed',
      originalPrice: product.originalPrice ? product.originalPrice.toNumber() : undefined,
      discountedPrice: product.discountedPrice ? product.discountedPrice.toNumber() : undefined,
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

const productSelect = {
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
  partner: {
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      website: true,
    },
  },
}

// Get initial products with caching for SSR using Next.js 16 Cache Components
export async function getInitialProducts() {
  'use cache'
  cacheLife('minutes') // Built-in profile: stale 5min, revalidate 1min, expire 1hr
  cacheTag('products')

  const [totalProducts, products, categoriesRaw] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: productSelect,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 12,
    }),
    prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
    }),
  ])

  const transformedProducts = products.map(transformProduct)
  
  const categories: ProductCategory[] = categoriesRaw.map((cat: { category: string; _count: { category: number } }) => ({
    name: cat.category,
    slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
    count: cat._count.category,
  }))

  return {
    products: transformedProducts,
    categories,
    totalProducts,
    totalPages: Math.ceil(totalProducts / 12),
  }
}

// Get featured products for homepage or other sections using Next.js 16 Cache Components
export async function getFeaturedProducts(limit: number = 4) {
  'use cache'
  cacheLife('minutes') // Built-in profile: stale 5min, revalidate 1min, expire 1hr
  cacheTag('products', 'featured-products')

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    select: productSelect,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return products.map(transformProduct)
}
