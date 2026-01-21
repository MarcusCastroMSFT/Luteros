'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Percent, Copy, Check, ExternalLink, CalendarDays, Tag, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductPreviewProps {
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  partnerName: string;
  partnerLogo?: string;
  discountPercentage: number;
  originalPrice?: string;
  discountedPrice?: string;
  promoCode: string;
  category: string;
  tags: string[];
  availability: string;
  validUntil?: string;
  features: string[];
  howToUse: string[];
  termsAndConditions?: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function ProductPreview({
  title,
  shortDescription,
  description,
  image,
  partnerName,
  partnerLogo,
  discountPercentage,
  originalPrice,
  discountedPrice,
  promoCode,
  category,
  tags,
  availability,
  validUntil,
  features,
  howToUse,
  termsAndConditions,
  isActive,
  isFeatured,
}: ProductPreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyPromoCode = async () => {
    if (promoCode) {
      try {
        await navigator.clipboard.writeText(promoCode);
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

  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23999"%3EImagem do Produto%3C/text%3E%3C/svg%3E';

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={image || placeholderImage}
            alt={title || 'Produto'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          
          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {!isActive && (
              <Badge variant="secondary" className="bg-gray-500 text-white">
                Inativo
              </Badge>
            )}
            {isFeatured && (
              <Badge className="bg-yellow-500 text-white border-yellow-500">
                <Star className="w-3 h-3 mr-1" />
                Em Destaque
              </Badge>
            )}
            <Badge variant={availability === 'members' ? 'default' : 'outline'} className={availability === 'members' ? 'bg-purple-600' : ''}>
              {availability === 'members' ? 'Somente Membros' : 'Todos'}
            </Badge>
          </div>

          {/* Discount Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-lg font-bold flex items-center gap-1 shadow-lg">
              <Percent size={16} />
              {discountPercentage || 0}% OFF
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Partner Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
            {partnerLogo ? (
              <Image
                src={partnerLogo}
                alt={partnerName || 'Parceiro'}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Logo
              </div>
            )}
          </div>
          <div>
            <span className="text-sm text-gray-600">Parceiro</span>
            <p className="font-medium">{partnerName || 'Nome do Parceiro'}</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title || 'Título do Produto'}
        </h1>

        {/* Short Description */}
        <p className="text-gray-600 mb-4">
          {shortDescription || 'A descrição curta do produto aparecerá aqui...'}
        </p>

        {/* Category and Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {category && (
            <Badge variant="outline">
              <Tag className="w-3 h-3 mr-1" />
              {category}
            </Badge>
          )}
          {tags.filter(t => t).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Promo Code Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Código Promocional</span>
            {validUntil && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                Válido até {formatDate(validUntil)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 bg-white rounded-lg border-2 border-dashed border-primary/30 font-mono text-lg font-bold text-center">
              {promoCode || 'CODIGO'}
            </code>
            <Button
              type="button"
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

          {/* Price Display */}
          {(originalPrice || discountedPrice) && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-primary/20">
              {originalPrice && (
                <span className="text-gray-500 line-through text-sm">
                  R$ {parseFloat(originalPrice).toFixed(2)}
                </span>
              )}
              {discountedPrice && (
                <span className="text-2xl font-bold text-primary">
                  R$ {parseFloat(discountedPrice).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">
            {description || 'A descrição completa do produto aparecerá aqui...'}
          </p>
        </div>

        {/* Features */}
        {features.filter(f => f).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Funcionalidades</h3>
            <ul className="space-y-2">
              {features.filter(f => f).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-primary font-bold">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How to Use */}
        {howToUse.filter(h => h).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Como Usar</h3>
            <ol className="space-y-2">
              {howToUse.filter(h => h).map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Terms */}
        {termsAndConditions && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Termos e Condições</h3>
            <p className="text-xs text-gray-500 whitespace-pre-wrap">
              {termsAndConditions}
            </p>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-6">
          <Button className="w-full cursor-pointer" size="lg" disabled>
            <ExternalLink className="w-4 h-4 mr-2" />
            Usar Desconto (Preview)
          </Button>
        </div>
      </div>
    </div>
  );
}
