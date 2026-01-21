import { memo } from 'react';
import Link from 'next/link';

interface CTAButton {
  href: string;
  text: string;
  variant: 'primary' | 'secondary';
}

interface FinalCTAProps {
  title?: string;
  description?: string;
  buttons?: CTAButton[];
  className?: string;
}

const defaultButtons: CTAButton[] = [
  {
    href: '/register',
    text: 'Começar Gratuitamente',
    variant: 'primary',
  },
  {
    href: '/contact',
    text: 'Falar com Vendas',
    variant: 'secondary',
  },
];

export const FinalCTA = memo<FinalCTAProps>(function FinalCTA({
  title = 'Pronto para acelerar seu aprendizado?',
  description = 'Junte-se a milhares de profissionais que já transformaram suas carreiras conosco.',
  buttons = defaultButtons,
  className = ''
}) {
  return (
    <section className={`text-center ${className}`} aria-labelledby="final-cta-title">
      <div className="bg-gradient-to-br from-cta-highlight via-cta-highlight/95 to-cta-highlight/90 rounded-xl p-12 text-white relative overflow-hidden">
        {/* Content */}
        <div className="relative z-10">
          <h2 id="final-cta-title" className="text-3xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  button.variant === 'primary'
                    ? 'bg-white text-cta-highlight hover:bg-gray-50 focus:ring-white'
                    : 'border-2 border-white/30 text-white hover:bg-white/10 focus:ring-white/50'
                }`}
                aria-describedby="final-cta-title"
              >
                {button.text}
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/3 rounded-full -translate-y-8" />
        </div>
      </div>
    </section>
  );
});
