import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductBadge } from './productBadge';
import { CalendarDays, ExternalLink, Percent, Tag } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isExpiringSoon = () => {
    const validUntil = new Date(product.validUntil);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Badges Overlay - Compact on mobile */}
          <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-2">
            <ProductBadge availability={product.availability} className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1" />
            {product.isFeatured && (
              <Badge className="bg-yellow-500 text-white border-yellow-500 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1">
                Em Destaque
              </Badge>
            )}
            {isExpiringSoon() && (
              <Badge variant="destructive" className="animate-pulse text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1">
                Últimos Dias
              </Badge>
            )}
          </div>

          {/* Discount Badge - Compact on mobile */}
          <div className="absolute top-2 md:top-3 right-2 md:right-3">
            <div className="bg-red-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-sm font-bold flex items-center gap-0.5 md:gap-1">
              <Percent size={10} className="md:w-3 md:h-3" />
              {product.discount.percentage}%
            </div>
          </div>
        </div>

        {/* Content - Compact on mobile */}
        <div className="p-2.5 md:p-4">
          {/* Partner Info - Hidden on mobile for space */}
          <div className="hidden md:flex items-center gap-2 mb-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={product.partner.logo}
                alt={product.partner.name}
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
            <span className="text-sm text-gray-600">
              {product.partner.name}
            </span>
          </div>

          {/* Title - Smaller on mobile */}
          <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-cta-highlight transition-colors leading-tight">
            {product.title}
          </h3>

          {/* Short Description - Hidden on mobile */}
          <p className="hidden md:block text-gray-600 text-sm mb-3 line-clamp-2">
            {product.shortDescription}
          </p>

          {/* Category - Single badge on mobile */}
          <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
            <Badge variant="outline" className="text-[10px] md:text-xs">
              {product.category}
            </Badge>
            {/* Hide tags on mobile */}
            <div className="hidden md:contents">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pricing - Simplified on mobile */}
          <div className="flex items-end justify-between mb-2 md:mb-3">
            <div>
              {product.discount.originalPrice && (
                <div className="text-[10px] md:text-sm text-gray-500 line-through">
                  R$ {product.discount.originalPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
              {product.discount.discountedPrice && (
                <div className="text-sm md:text-lg font-bold text-green-600">
                  R$ {product.discount.discountedPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
            </div>
            {/* Economy - Hidden on mobile */}
            <div className="hidden md:block text-right">
              <div className="text-xs text-gray-500">Economia</div>
              <div className="text-sm font-medium text-red-600">
                R$ {(product.discount.originalPrice! - product.discount.discountedPrice!).toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* Promo Code - Compact on mobile */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 p-1.5 md:p-2 bg-gray-50 rounded">
            <Tag size={12} className="md:w-3.5 md:h-3.5 text-cta-highlight shrink-0" />
            <span className="text-[10px] md:text-sm font-mono font-medium text-gray-900 truncate">
              {product.promoCode}
            </span>
          </div>

          {/* Valid Until - Smaller on mobile */}
          <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-500 mb-2 md:mb-4">
            <CalendarDays size={10} className="md:w-3 md:h-3" />
            <span className="hidden md:inline">Válido até </span>
            <span className="md:hidden">Até </span>
            {formatDate(product.validUntil)}
          </div>

          {/* Usage Stats - Hidden on mobile */}
          <div className="hidden md:flex justify-between items-center text-xs text-gray-500 mb-4">
            <span>{product.usageCount} usos</span>
            {product.maxUsages && (
              <span>
                {Math.round((product.usageCount / product.maxUsages) * 100)}% utilizado
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons - Simplified on mobile */}
      <div className="p-2.5 md:p-4 pt-0 flex gap-2">
        <Button asChild className="flex-1 cursor-pointer text-xs md:text-sm h-8 md:h-10">
          <Link href={`/products/${product.slug}`}>
            <span className="hidden md:inline">Ver Detalhes</span>
            <span className="md:hidden">Ver mais</span>
          </Link>
        </Button>
        {/* External link button - Hidden on mobile, available on detail page */}
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="cursor-pointer hidden md:flex"
        >
          <Link 
            href={product.partner.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <ExternalLink size={14} />
            Ir para Loja
          </Link>
        </Button>
      </div>
    </div>
  );
}
