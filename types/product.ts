export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  partner: {
    id: string;
    name: string;
    logo: string;
    website: string;
  };
  discount: {
    percentage: number;
    amount?: number;
    type: 'percentage' | 'fixed';
    originalPrice?: number;
    discountedPrice?: number;
  };
  promoCode: string;
  category: string;
  tags: string[];
  availability: 'all' | 'members';
  validUntil: string;
  termsAndConditions: string;
  howToUse: string[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdDate: string;
  usageCount: number;
  maxUsages?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface ProductsFilters {
  category?: string;
  availability?: 'all' | 'members';
  search?: string;
  featured?: boolean;
}

export interface ProductsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductsApiResponse {
  success: boolean;
  data: Product[];
  pagination: ProductsPagination;
  categories: ProductCategory[];
}

export interface ProductApiResponse {
  success: boolean;
  data: {
    product: Product;
    relatedProducts: Product[];
  } | null;
  error?: string;
}

export interface ProductCardProps {
  product: Product;
}

export interface ProductBadgeProps {
  availability: 'all' | 'members';
  className?: string;
}

export interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
}
