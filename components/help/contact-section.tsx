import { memo } from 'react';
import Link from 'next/link';
import { MessageCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface ContactSectionProps {
  className?: string;
}

export const ContactSection = memo<ContactSectionProps>(function ContactSection({ 
  className = '' 
}) {
  return (
    <section 
      className={`bg-gradient-to-br from-cta-highlight via-cta-highlight/95 to-cta-highlight/90 
        dark:bg-gradient-to-br dark:from-brand-900/80 dark:via-brand-800/70 dark:to-brand-900/60
        dark:border dark:border-brand-700/50
        rounded-xl p-8 text-center shadow-lg ${className}`}
      aria-labelledby="contact-section-title"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/20 dark:bg-brand-600/30 p-4 rounded-xl shadow-sm 
          dark:border dark:border-brand-500/30">
          <MessageCircle 
            className="text-white dark:text-brand-200 drop-shadow-sm" 
            size={40} 
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        <h2 
          id="contact-section-title"
          className="text-2xl md:text-3xl font-bold text-white dark:text-brand-100 mb-3 drop-shadow-sm"
        >
          Ainda precisa de ajuda?
        </h2>
        <p className="text-white/95 dark:text-brand-200/90 mb-8 text-lg leading-relaxed">
          Nossa equipe especializada está disponível para ajudar você com qualquer dúvida. 
          Também confira nossa seção de perguntas frequentes.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/contact"
            className="inline-flex items-center bg-white text-cta-highlight 
              hover:bg-gray-50 active:bg-gray-100
              dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500 dark:active:bg-brand-700
              px-6 py-3 rounded-lg font-semibold transition-all duration-200
              shadow-md hover:shadow-lg active:scale-95
              focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 
              focus:ring-offset-cta-highlight dark:focus:ring-brand-400/50 dark:focus:ring-offset-brand-800"
            aria-describedby="contact-section-title"
          >
            <MessageCircle className="mr-2" size={18} aria-hidden="true" />
            Contatar Suporte
            <ArrowRight className="ml-2" size={16} aria-hidden="true" />
          </Link>

          <Link
            href="/faq"
            className="inline-flex items-center bg-transparent text-white 
              border-2 border-white/30 hover:border-white/50 hover:bg-white/10
              active:bg-white/20
              dark:bg-transparent dark:text-brand-200 dark:border-brand-400/40 
              dark:hover:border-brand-300/60 dark:hover:bg-brand-600/20 dark:active:bg-brand-600/30
              px-6 py-3 rounded-lg font-semibold transition-all duration-200
              shadow-md hover:shadow-lg active:scale-95
              focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 
              focus:ring-offset-cta-highlight dark:focus:ring-brand-400/50 dark:focus:ring-offset-brand-800"
            aria-describedby="contact-section-title"
          >
            <HelpCircle className="mr-2" size={18} aria-hidden="true" />
            Ver FAQ
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-brand-400/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 dark:bg-brand-400/10 rounded-full translate-y-12 -translate-x-12" />
      </div>
    </section>
  );
});
