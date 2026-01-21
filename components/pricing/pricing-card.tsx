import { memo } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight } from 'lucide-react';
import type { PricingPlan } from '@/types/pricing';

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
  className?: string;
}

export const PricingCard = memo<PricingCardProps>(function PricingCard({
  plan,
  isYearly,
  className = ''
}) {
  const price = isYearly ? plan.price.yearly : plan.price.monthly;
  const monthlyPrice = isYearly ? plan.price.yearly / 12 : plan.price.monthly;
  
  return (
    <div
      className={`relative bg-white border rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 ${
        plan.popular
          ? 'border-cta-highlight ring-1 ring-cta-highlight/20 scale-105'
          : 'border-gray-200 hover:border-gray-300'
      } ${className}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-cta-highlight text-white text-sm font-medium px-4 py-1 rounded-full">
            Mais Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {plan.name}
        </h3>
        <p className="text-gray-600 mb-6">
          {plan.description}
        </p>
        
        {/* Price */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {plan.currency}
            </span>
            <span className="text-5xl font-bold text-gray-900">
              {price === 0 ? '0' : monthlyPrice.toFixed(2).replace('.', ',')}
            </span>
            {price > 0 && (
              <span className="text-gray-600 text-lg">
                /mês
              </span>
            )}
          </div>
          {isYearly && price > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Cobrado anualmente ({plan.currency}{price.toFixed(2).replace('.', ',')})
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={plan.id === 'free' ? '/register' : `/subscribe?plan=${plan.id}&billing=${isYearly ? 'yearly' : 'monthly'}`}
          className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 group ${
            plan.buttonVariant === 'filled'
              ? 'bg-cta-highlight text-white hover:bg-cta-highlight/90 focus:ring-cta-highlight shadow-md hover:shadow-lg'
              : 'border-2 border-gray-300 text-gray-700 hover:border-cta-highlight hover:text-cta-highlight focus:ring-cta-highlight'
          }`}
        >
          {plan.buttonText}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
          Recursos Incluídos
        </h4>
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature.id} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                feature.included
                  ? feature.highlight
                    ? 'bg-cta-highlight text-white'
                    : 'bg-green-100'
                  : 'bg-gray-100'
              }`}>
                {feature.included ? (
                  <Check className="w-3 h-3 text-current" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <span className={`text-sm ${
                feature.included
                  ? feature.highlight
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-700'
                  : 'text-gray-400'
              }`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
