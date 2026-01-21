import { memo } from 'react';

interface TrustIndicator {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClasses: {
    background: string;
    icon: string;
  };
}

interface TrustIndicatorsProps {
  className?: string;
}

const trustIndicators: TrustIndicator[] = [
  {
    id: 'guarantee',
    title: 'Garantia de 7 dias',
    description: 'Reembolso total sem perguntas',
    colorClasses: {
      background: 'bg-green-100',
      icon: 'text-green-600',
    },
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Pagamento Seguro',
    description: 'Suas informações estão protegidas',
    colorClasses: {
      background: 'bg-blue-100',
      icon: 'text-blue-600',
    },
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'support',
    title: 'Suporte Dedicado',
    description: 'Estamos aqui para ajudar você',
    colorClasses: {
      background: 'bg-purple-100',
      icon: 'text-purple-600',
    },
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const TrustIndicators = memo<TrustIndicatorsProps>(function TrustIndicators({
  className = ''
}) {
  return (
    <section 
      className={`bg-white rounded-xl p-8 shadow-sm border border-gray-200 ${className}`}
      aria-labelledby="trust-indicators-title"
    >
      <h2 id="trust-indicators-title" className="sr-only">
        Indicadores de Confiança
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {trustIndicators.map((indicator) => (
          <div key={indicator.id} className="flex flex-col items-center">
            <div className={`w-16 h-16 ${indicator.colorClasses.background} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <div className={indicator.colorClasses.icon} aria-hidden="true">
                {indicator.icon}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {indicator.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {indicator.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
});
