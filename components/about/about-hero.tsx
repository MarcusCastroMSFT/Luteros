import { memo } from 'react';

interface AboutHeroProps {
  title: string;
  subtitle: string;
  description: string;
  className?: string;
}

export const AboutHero = memo<AboutHeroProps>(function AboutHero({
  title,
  subtitle,
  description,
  className = ''
}) {
  return (
    <section 
      className={`relative bg-gradient-to-br from-cta-highlight via-cta-highlight/95 to-cta-highlight/90 dark:bg-gradient-to-br dark:from-orange-900/80 dark:via-orange-800/70 dark:to-orange-900/60 dark:border-b dark:border-orange-700/50 text-white overflow-hidden ${className}`}
      aria-labelledby="about-hero-title"
    >
      <div className="container mx-auto px-4 py-20 max-w-6xl relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            id="about-hero-title"
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            {title}
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-white/90 dark:text-orange-200/90 mb-8">
            {subtitle}
          </p>
          <p className="text-lg text-white/80 dark:text-orange-200/80 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 dark:bg-orange-400/10 rounded-full" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 dark:bg-orange-400/10 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 dark:bg-orange-400/8 rounded-full" />
        <div className="absolute top-1/4 right-1/3 w-20 h-20 bg-white/5 dark:bg-orange-400/8 rounded-full" />
      </div>
    </section>
  );
});
