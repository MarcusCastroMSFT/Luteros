import { memo } from 'react';
import type { AboutMilestone } from '@/types/about';

interface AboutTimelineProps {
  milestones: AboutMilestone[];
  className?: string;
}

export const AboutTimeline = memo<AboutTimelineProps>(function AboutTimeline({
  milestones,
  className = ''
}) {
  return (
    <section className={`py-20 bg-white dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Nossa Jornada
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Uma trajetória de crescimento constante, inovação e compromisso com a educação de qualidade.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transform md:-translate-x-0.5" />

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-row`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-cta-highlight rounded-full border-4 border-white dark:border-gray-900 transform md:-translate-x-2 z-10" />

                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-12 pl-16' : 'md:pl-12 pl-16'} md:pl-0`}>
                  <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-cta-highlight dark:hover:border-cta-highlight transition-colors ${
                    index % 2 === 0 ? '' : 'md:text-right'
                  }`}>
                    <div className="text-cta-highlight dark:text-cta-highlight font-bold text-lg mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Spacer for alternating layout on desktop */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
