import { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PricingFAQItem } from '@/types/pricing';

interface PricingFAQProps {
  faqs: PricingFAQItem[];
  className?: string;
}

export const PricingFAQ = memo<PricingFAQProps>(function PricingFAQ({
  faqs,
  className = ''
}) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className={`max-w-3xl mx-auto ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Perguntas Frequentes
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Tire suas dúvidas sobre nossos planos e serviços
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openItems.includes(faq.id);
          
          return (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-cta-highlight focus:ring-inset"
                aria-expanded={isOpen}
                aria-controls={`faq-content-${faq.id}`}
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {isOpen && (
                <div
                  id={`faq-content-${faq.id}`}
                  className="px-6 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
