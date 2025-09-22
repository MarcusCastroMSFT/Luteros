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
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <ProductBadge availability={product.availability} />
            {product.isFeatured && (
              <Badge className="bg-yellow-500 text-white border-yellow-500">
                Em Destaque
              </Badge>
            )}
            {isExpiringSoon() && (
              <Badge variant="destructive" className="animate-pulse">
                Últimos Dias
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Percent size={12} />
              {product.discount.percentage}% OFF
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Partner Info */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={product.partner.logo}
                alt={product.partner.name}
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.partner.name}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {product.title}
          </h3>

          {/* Short Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {product.shortDescription}
          </p>

          {/* Category and Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              {product.discount.originalPrice && (
                <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  R$ {product.discount.originalPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
              {product.discount.discountedPrice && (
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  R$ {product.discount.discountedPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Economia</div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                R$ {(product.discount.originalPrice! - product.discount.discountedPrice!).toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <Tag size={14} className="text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
              {product.promoCode}
            </span>
          </div>

          {/* Valid Until */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <CalendarDays size={12} />
            Válido até {formatDate(product.validUntil)}
          </div>

          {/* Usage Stats */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span>{product.usageCount} usos</span>
            {product.maxUsages && (
              <span>
                {Math.round((product.usageCount / product.maxUsages) * 100)}% utilizado
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="p-4 pt-0 flex gap-2">
        <Button asChild className="flex-1 cursor-pointer">
          <Link href={`/products/${product.slug}`}>
            Ver Detalhes
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="cursor-pointer"
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
