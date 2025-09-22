'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductBadge } from '@/components/products/productBadge';
import { ProductDetailSkeleton } from '@/components/products/productDetailSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar,
  Eye,
  CheckCircle,
  Tag,
  Percent,
  Info
} from 'lucide-react';
import { Product, ProductApiResponse } from '@/types/product';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${slug}`);
        const result: ProductApiResponse = await response.json();

        if (result.success && result.data) {
          setProduct(result.data.product);
          setRelatedProducts(result.data.relatedProducts);
        } else {
          setError(result.error || 'Produto não encontrado');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Erro ao carregar produto');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const copyPromoCode = async () => {
    if (!product) return;
    
    try {
      await navigator.clipboard.writeText(product.promoCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const isExpiringSoon = () => {
    if (!product) return false;
    const validUntil = new Date(product.validUntil);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Produto não encontrado'}
          </div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            O produto solicitado não pôde ser encontrado.
          </div>
          <Button asChild>
            <Link href="/products">Voltar aos Produtos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link href="/products" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer">
              Produtos
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <ProductBadge availability={product.availability} />
                  {product.isFeatured && (
                    <Badge className="bg-yellow-500 text-white border-yellow-500">
                      Em Destaque
                    </Badge>
                  )}
                  {isExpiringSoon() && (
                    <Badge variant="destructive" className="animate-pulse">
                      Últimos Dias!
                    </Badge>
                  )}
                </div>

                {/* Discount Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white px-3 py-2 rounded-full text-lg font-bold flex items-center gap-1">
                    <Percent size={16} />
                    {product.discount.percentage}% OFF
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Partner Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={product.partner.logo}
                      alt={product.partner.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {product.partner.name}
                    </h4>
                    <Link 
                      href={product.partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Visitar Site <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.title}
                </h1>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    O que está incluído:
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to Use */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Como usar o desconto:
                  </h3>
                  <ol className="space-y-2">
                    {product.howToUse.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info size={16} />
                    Termos e Condições
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.termsAndConditions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Price Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {/* Pricing */}
                <div className="mb-4">
                  {product.discount.originalPrice && (
                    <div className="text-lg text-gray-500 dark:text-gray-400 line-through mb-1">
                      R$ {product.discount.originalPrice.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                  {product.discount.discountedPrice && (
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      R$ {product.discount.discountedPrice.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Economia de R$ {(product.discount.originalPrice! - product.discount.discountedPrice!).toFixed(2).replace('.', ',')} ({product.discount.percentage}%)
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Código Promocional:
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                      <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                        {product.promoCode}
                      </span>
                    </div>
                    <Button
                      onClick={copyPromoCode}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      {codeCopied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                  {codeCopied && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Código copiado!
                    </p>
                  )}
                </div>

                {/* Valid Until */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <Calendar size={16} />
                  Válido até {formatDate(product.validUntil)}
                  {isExpiringSoon() && (
                    <Badge variant="destructive" className="ml-auto">
                      Expira em breve!
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={copyPromoCode}
                    className="w-full cursor-pointer"
                    size="lg"
                  >
                    <Tag size={16} className="mr-2" />
                    {codeCopied ? 'Código Copiado!' : 'Copiar Código'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    asChild
                    className="w-full cursor-pointer"
                    size="lg"
                  >
                    <Link 
                      href={product.partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Ir para a Loja
                    </Link>
                  </Button>
                </div>

                {/* Usage Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Eye size={14} />
                      {product.usageCount} usos
                    </div>
                    {product.maxUsages && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {Math.round((product.usageCount / product.maxUsages) * 100)}% utilizado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Produtos Relacionados
                  </h3>
                  <div className="space-y-4">
                    {relatedProducts.slice(0, 3).map((relatedProduct) => (
                      <Link 
                        key={relatedProduct.id}
                        href={`/products/${relatedProduct.slug}`}
                        className="group flex gap-3 cursor-pointer"
                      >
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={relatedProduct.image}
                            alt={relatedProduct.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 line-clamp-2 text-sm">
                            {relatedProduct.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                            {relatedProduct.shortDescription}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {relatedProduct.discount.percentage}% OFF
                            </span>
                            <ProductBadge 
                              availability={relatedProduct.availability} 
                              className="scale-75 -ml-1"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {relatedProducts.length > 3 && (
                    <div className="mt-4">
                      <Button variant="outline" asChild className="w-full cursor-pointer">
                        <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
                          Ver mais produtos similares
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
