import { memo } from 'react';
import { Award, Lightbulb, Users, Globe } from 'lucide-react';
import type { AboutValue } from '@/types/about';

interface AboutValuesProps {
  values: AboutValue[];
  className?: string;
}

// Icon mapping function
const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Award,
    Lightbulb,
    Users,
    Globe,
  };
  return icons[iconName] || Award;
};

export const AboutValues = memo<AboutValuesProps>(function AboutValues({
  values,
  className = ''
}) {
  return (
    <section className={`py-20 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Nossos Valores
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Os princípios que norteiam nossa missão e definem nossa identidade como organização comprometida com a excelência educacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value) => {
            const Icon = getIconComponent(value.icon);
            
            return (
              <div
                key={value.id}
                className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:border-cta-highlight transition-all duration-300 hover:shadow-lg group"
              >
                <div className="bg-cta-highlight/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-cta-highlight/20 transition-colors">
                  <Icon className="w-8 h-8 text-cta-highlight" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
