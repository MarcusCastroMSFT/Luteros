import { memo } from 'react';
import Link from 'next/link';
import { Linkedin, Twitter, Github } from 'lucide-react';
import type { TeamMember } from '@/types/about';

interface AboutTeamProps {
  team: TeamMember[];
  className?: string;
}

export const AboutTeam = memo<AboutTeamProps>(function AboutTeam({
  team,
  className = ''
}) {
  const getSocialIcon = (platform: string) => {
    const icons = {
      linkedin: Linkedin,
      twitter: Twitter,
      github: Github,
    };
    return icons[platform as keyof typeof icons] || Linkedin;
  };

  return (
    <section className={`py-20 bg-gray-50 dark:bg-gray-800 ${className}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Nossa Equipe
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Conheça as pessoas apaixonadas que tornam a Luteros possível e trabalham incansavelmente para oferecer a melhor experiência educacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700 hover:border-cta-highlight dark:hover:border-cta-highlight transition-all duration-300 hover:shadow-lg group"
            >
              {/* Profile Image */}
              <div className="relative w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="w-full h-full bg-gradient-to-br from-cta-highlight/20 to-cta-highlight/40 dark:from-orange-600/30 dark:to-orange-500/50 flex items-center justify-center">
                  <span className="text-2xl font-bold text-cta-highlight dark:text-orange-300">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Member Info */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {member.name}
              </h3>
              <p className="text-cta-highlight dark:text-cta-highlight font-medium mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {member.description}
              </p>

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                {Object.entries(member.social).map(([platform, url]) => {
                  if (!url) return null;
                  
                  const Icon = getSocialIcon(platform);
                  
                  return (
                    <Link
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-cta-highlight dark:hover:bg-cta-highlight rounded-full flex items-center justify-center transition-colors group"
                      aria-label={`${member.name} no ${platform}`}
                    >
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
