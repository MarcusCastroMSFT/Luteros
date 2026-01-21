'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  discount: {
    percentage: number;
    amount?: number;
    type: 'percentage' | 'fixed';
    originalPrice?: number;
    discountedPrice?: number;
  };
  promoCode: string;
  category: string;
  partner: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
  };
  features: string[];
  howToUse: string[];
  termsAndConditions: string;
  isActive: boolean;
  isFeatured: boolean;
  availability: "all" | "members";
  usageCount: number;
  maxUsages?: number;
  validUntil?: string;
  createdDate: string;
}

interface ViewProductModalProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Cache products in memory to avoid refetching on every open
const productCache = new Map<string, Product>();

export function ViewProductModal({
  productId,
  open,
  onOpenChange,
}: ViewProductModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch product');
      }

      // API returns data.product for single product endpoint
      const productData = data.data?.product || data.data;
      
      // Cache the product for future opens
      productCache.set(productId, productData);
      setProduct(productData);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productId) {
      // Check cache first
      const cached = productCache.get(productId);
      if (cached) {
        setProduct(cached);
        setLoading(false);
        return;
      }
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId]);

  const handleViewLive = () => {
    if (product) {
      window.open(`/products/${product.slug}`, '_blank');
    }
  };

  const copyPromoCode = async () => {
    if (product) {
      try {
        await navigator.clipboard.writeText(product.promoCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Visualizar Produto</DialogTitle>
            {product && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewLive}
                className="cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver página ao vivo
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {product && !loading && !error && (
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {!product.isActive && (
                  <Alert className="mb-2">
                    <AlertDescription>
                      Este produto está inativo e não está visível publicamente.
                    </AlertDescription>
                  </Alert>
                )}
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Ativo" : "Inativo"}
                </Badge>
                {product.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Destaque
                  </Badge>
                )}
                <Badge variant="outline">
                  {product.availability === "members" ? "Somente Membros" : "Todos os Usuários"}
                </Badge>
              </div>

              {/* Product Image */}
              {product.image && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Product Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Parceiro</span>
                    <div className="flex items-center gap-2 mt-1">
                      {product.partner.logo && (
                        <Image
                          src={product.partner.logo}
                          alt={product.partner.name}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                      )}
                      <span className="font-medium">{product.partner.name}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Categoria</span>
                    <p className="capitalize">{product.category}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Descrição</span>
                    <p className="text-sm">{product.description}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Discount & Code */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                        {product.discount.percentage}% OFF
                      </Badge>
                      {product.discount.originalPrice && product.discount.discountedPrice && (
                        <div className="text-right">
                          <span className="text-sm line-through text-muted-foreground">
                            R$ {product.discount.originalPrice.toFixed(2)}
                          </span>
                          <span className="ml-2 text-lg font-bold text-primary">
                            R$ {product.discount.discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white rounded border font-mono text-sm">
                        {product.promoCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyPromoCode}
                        className="cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Uso</span>
                    <p>
                      {product.usageCount.toLocaleString()} usos
                      {product.maxUsages && (
                        <span className="text-muted-foreground"> / {product.maxUsages.toLocaleString()} máximo</span>
                      )}
                    </p>
                  </div>

                  {/* Validity */}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Validade</span>
                    <p>
                      {product.validUntil ? `Até ${formatDate(product.validUntil)}` : "Sem prazo definido"}
                    </p>
                  </div>

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Funcionalidades</span>
                      <ul className="mt-1 space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* How to Use */}
                  {product.howToUse && product.howToUse.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Como Usar</span>
                      <ol className="mt-1 space-y-1 list-decimal list-inside">
                        {product.howToUse.map((step, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Terms */}
                  {product.termsAndConditions && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Termos e Condições</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.termsAndConditions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Criado em: {formatDate(product.createdDate)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
