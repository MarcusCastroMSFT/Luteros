'use client';

import { useState } from 'react';
import Head from 'next/head';
import { BillingToggle, PricingCard, PricingFAQ, TrustIndicators, FinalCTA } from '@/components/pricing';
import { pricingPlans, pricingFAQ, yearlyDiscount } from '@/data/pricing';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <Head>
        <title>Planos e Preços | Luteros - Aprenda e Evolua</title>
        <meta name="description" content="Escolha o plano ideal para acelerar seu aprendizado. Plano gratuito disponível, Premium a partir de R$ 39,90/mês. Garantia de 7 dias." />
        <meta name="keywords" content="preços luteros, planos de assinatura, cursos online, aprendizado premium, educação profissional, desenvolvimento de carreira" />
        <link rel="canonical" href="/pricing" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">

        <div className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Pricing Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nossos <span className="text-cta-highlight">Preços</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Investir em conhecimento é investir no seu futuro. Escolha o plano que melhor se adapta às suas necessidades e objetivos.
            </p>

            {/* Billing Toggle */}
            <BillingToggle
              isYearly={isYearly}
              onToggle={setIsYearly}
              discount={yearlyDiscount.description}
            />
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={isYearly}
              />
            ))}
          </div>

          {/* Trust Indicators */}
          <TrustIndicators className="mb-20" />

          {/* FAQ Section */}
          <PricingFAQ faqs={pricingFAQ} />

          {/* Final CTA */}
          <FinalCTA className="mt-20" />
        </div>
      </div>
    </>
  );
}
