import { memo } from 'react';
import type { AboutStats } from '@/types/about';

interface AboutStatsProps {
  stats: AboutStats[];
  className?: string;
}

export const AboutStatsSection = memo<AboutStatsProps>(function AboutStatsSection({
  stats,
  className = ''
}) {
  return (
    <section className={`py-20 bg-white dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Nosso Impacto em Números
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Resultado do nosso compromisso com a excelência educacional e o desenvolvimento profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="text-center group"
            >
              <div className="bg-gradient-to-br from-cta-highlight via-cta-highlight/95 to-cta-highlight/90 dark:bg-gradient-to-br dark:from-orange-900/80 dark:via-orange-800/70 dark:to-orange-900/60 rounded-xl p-8 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-white/90 dark:text-orange-200/90">
                  {stat.label}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
