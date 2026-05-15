import { cacheLife, cacheTag } from 'next/cache'
import { and, desc, eq, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products, productPartners } from '@/lib/db/schema'
import { Product } from '@/types/product'

type ProductRow = {
  id: string; slug: string; title: string; description: string; shortDescription: string;
  image: string | null; discountPercentage: number; discountType: string;
  originalPrice: string | null; discountedPrice: string | null; discountAmount: string | null;
  promoCode: string; category: string; tags: string[]; availability: string;
  validUntil: Date | null; termsAndConditions: string | null; howToUse: string[];
  features: string[]; isActive: boolean; isFeatured: boolean; usageCount: number;
  maxUsages: number | null; createdAt: Date;
  partnerId: string; partnerName: string; partnerSlug: string; partnerLogo: string | null; partnerWebsite: string | null;
}

function transformProduct(p: ProductRow): Product {
  return {
    id: p.id, slug: p.slug, title: p.title, description: p.description,
    shortDescription: p.shortDescription, image: p.image || '',
    partner: { id: p.partnerId, name: p.partnerName, logo: p.partnerLogo || '', website: p.partnerWebsite || '' },
    discount: {
      percentage: p.discountPercentage,
      amount: p.discountAmount ? Number(p.discountAmount) : undefined,
      type: p.discountType as 'percentage' | 'fixed',
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : undefined,
    },
    promoCode: p.promoCode, category: p.category, tags: p.tags,
    availability: p.availability as 'all' | 'members',
    validUntil: p.validUntil?.toISOString().split('T')[0] || '',
    termsAndConditions: p.termsAndConditions || '',
    howToUse: p.howToUse, features: p.features,
    isActive: p.isActive, isFeatured: p.isFeatured,
    createdDate: p.createdAt.toISOString().split('T')[0],
    usageCount: p.usageCount, maxUsages: p.maxUsages || undefined,
  }
}

const productCols = {
  id: products.id, slug: products.slug, title: products.title, description: products.description,
  shortDescription: products.shortDescription, image: products.image,
  discountPercentage: products.discountPercentage, discountType: products.discountType,
  originalPrice: products.originalPrice, discountedPrice: products.discountedPrice,
  discountAmount: products.discountAmount, promoCode: products.promoCode,
  category: products.category, tags: products.tags, availability: products.availability,
  validUntil: products.validUntil, termsAndConditions: products.termsAndConditions,
  howToUse: products.howToUse, features: products.features, isActive: products.isActive,
  isFeatured: products.isFeatured, usageCount: products.usageCount, maxUsages: products.maxUsages,
  createdAt: products.createdAt,
  partnerId: productPartners.id, partnerName: productPartners.name, partnerSlug: productPartners.slug,
  partnerLogo: productPartners.logo, partnerWebsite: productPartners.website,
}

// Fetch product by slug directly from database
async function fetchProductBySlug(slug: string) {
  const product = await db.select(productCols).from(products).innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(and(eq(products.slug, slug), eq(products.isActive, true))).limit(1).then((r) => r[0] ?? null)
  if (!product) return null
  return transformProduct(product)
}

// Fetch related products
async function fetchRelatedProducts(productId: string, category: string) {
  const rows = await db.select(productCols).from(products).innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(and(eq(products.isActive, true), eq(products.category, category), ne(products.id, productId))).orderBy(desc(products.isFeatured), desc(products.usageCount)).limit(4)
  return rows.map(transformProduct)
}

// Fetch metadata only (lightweight query for generateMetadata)
async function fetchProductMetadata(slug: string) {
  const row = await db.select({ title: products.title, shortDescription: products.shortDescription, description: products.description, image: products.image, category: products.category, partnerName: productPartners.name }).from(products).innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(and(eq(products.slug, slug), eq(products.isActive, true))).limit(1).then((r) => r[0] ?? null)
  if (!row) return null
  return { title: row.title, description: row.shortDescription || row.description, image: row.image, category: row.category, partnerName: row.partnerName }
}

export async function getProductBySlug(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `product-${slug}`)
  return fetchProductBySlug(slug)
}

export async function getRelatedProducts(productId: string, category: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `related-products-${productId}`)
  return fetchRelatedProducts(productId, category)
}

export async function getProductMetadata(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `product-${slug}`)
  return fetchProductMetadata(slug)
}

export async function getAllProductSlugs() {
  'use cache'
  cacheLife('hours')
  cacheTag('products', 'product-slugs')
  const rows = await db.select({ slug: products.slug }).from(products).where(eq(products.isActive, true))
  return rows.map((p) => ({ slug: p.slug }))
}
