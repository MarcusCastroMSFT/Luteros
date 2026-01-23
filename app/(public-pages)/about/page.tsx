'use client';

import { 
  AboutHero, 
  MissionVision, 
  AboutValues, 
  AboutStatsSection, 
  AboutTeam, 
  AboutTimeline 
} from '@/components/about';
import { FinalCTA } from '@/components/pricing';
import { 
  aboutContent, 
  aboutValues, 
  aboutStats, 
  teamMembers, 
  aboutMilestones 
} from '@/data/about';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <AboutHero
        title={aboutContent.hero.title}
        subtitle={aboutContent.hero.subtitle}
        description={aboutContent.hero.description}
      />

      {/* Mission & Vision */}
      <MissionVision
        mission={aboutContent.mission}
        vision={aboutContent.vision}
      />

      {/* Values */}
      <AboutValues values={aboutValues} />

      {/* Stats */}
      <AboutStatsSection stats={aboutStats} />

      {/* Timeline */}
      <AboutTimeline milestones={aboutMilestones} />

      {/* Team */}
      <AboutTeam team={teamMembers} />

      {/* Final CTA */}
      <FinalCTA 
        title="Faça parte da nossa comunidade"
        description="Junte-se a milhares de profissionais que escolheram a lutteros para acelerar suas carreiras e alcançar seus objetivos."
        className="mt-0 mb-20"
      />
    </div>
  );
}
