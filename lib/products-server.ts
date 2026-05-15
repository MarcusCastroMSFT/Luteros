import { cacheLife, cacheTag } from 'next/cache'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products, productPartners } from '@/lib/db/schema'
import { Product, ProductCategory } from '@/types/product'

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

export async function getInitialProducts() {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')

  const [rows, categoriesRaw, [{ total }]] = await Promise.all([
    db.select(productCols).from(products).innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(eq(products.isActive, true)).orderBy(desc(products.isFeatured), desc(products.createdAt)).limit(12),
    db.select({ category: products.category, count: sql<number>`count(*)::int` }).from(products).where(eq(products.isActive, true)).groupBy(products.category),
    db.select({ total: sql<number>`count(*)::int` }).from(products).where(eq(products.isActive, true)),
  ])

  const transformedProducts = rows.map(transformProduct)
  const categories: ProductCategory[] = categoriesRaw.map((cat) => ({
    name: cat.category,
    slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
    count: Number(cat.count),
  }))
  const totalProducts = Number(total)

  return { products: transformedProducts, categories, totalProducts, totalPages: Math.ceil(totalProducts / 12) }
}

export async function getFeaturedProducts(limit: number = 4) {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', 'featured-products')

  const rows = await db.select(productCols).from(products).innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(and(eq(products.isActive, true), eq(products.isFeatured, true))).orderBy(desc(products.createdAt)).limit(limit)
  return rows.map(transformProduct)
}
