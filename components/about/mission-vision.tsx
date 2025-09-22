import { memo } from 'react';
import { Target, Eye } from 'lucide-react';

interface MissionVisionProps {
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
  className?: string;
}

export const MissionVision = memo<MissionVisionProps>(function MissionVision({
  mission,
  vision,
  className = ''
}) {
  return (
    <section className={`py-20 bg-white dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="bg-cta-highlight/10 dark:bg-cta-highlight/20 p-3 rounded-lg mr-4">
                <Target className="w-8 h-8 text-cta-highlight dark:text-cta-highlight" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {mission.title}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="bg-cta-highlight/10 dark:bg-cta-highlight/20 p-3 rounded-lg mr-4">
                <Eye className="w-8 h-8 text-cta-highlight dark:text-cta-highlight" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {vision.title}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              {vision.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
