'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/common/pageHeader';
import { SpecialistInfo } from '@/components/specialists/specialistInfo';
import { SpecialistDetailSkeleton } from '@/components/specialists/specialistDetailSkeleton';
import { Clock, Star, Award } from 'lucide-react';
import { type Specialist } from '@/types/specialist';

interface SpecialistApiResponse {
  success: boolean;
  data?: {
    specialist: Specialist;
    relatedSpecialists: Specialist[];
  };
  error?: string;
}

interface SpecialistPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getSpecialist(slug: string) {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/specialists/${slug}`, {
      cache: 'no-store', // Ensure fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data: SpecialistApiResponse = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching specialist:', error);
    return null;
  }
}

export default function SpecialistPage({ params }: SpecialistPageProps) {
  const { slug } = React.use(params);
  const [specialistData, setSpecialistData] = useState<{ specialist: Specialist; relatedSpecialists: Specialist[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialist = async () => {
      setIsLoading(true);
      setError(null);
      
      const data = await getSpecialist(slug);
      
      if (data) {
        setSpecialistData(data);
      } else {
        setError('Specialist not found');
      }
      
      setIsLoading(false);
    };

    fetchSpecialist();
  }, [slug]);

  if (isLoading) {
    return <SpecialistDetailSkeleton />;
  }

  if (error || !specialistData) {
    notFound();
  }

  const { specialist } = specialistData;

  const handleContact = () => {
    // Handle contact logic
    console.log('Contact clicked for specialist:', specialist.id);
  };

  const handleMessage = () => {
    // Handle message logic
    console.log('Message clicked for specialist:', specialist.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <PageHeader
        title={specialist.name}
        description={specialist.bio}
        align="left"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Especialistas', href: '/specialists' },
          { label: specialist.name }
        ]}
      />
      
      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Specialist Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{specialist.profession}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--cta-highlight)' }} />
                <span>{specialist.experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400" style={{ color: '#fbbf24' }} />
                <span>{specialist.rating.toFixed(1)} ({specialist.studentsCount} avaliações)</span>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Sobre o Especialista
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {specialist.fullBio || specialist.bio}
                </p>
              </div>
            </div>

            {/* Education Section - Only show if data exists */}
            {specialist.education && specialist.education.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Formação
                  </h2>
                  <ul className="space-y-3">
                    {specialist.education.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                        <span className="text-cta-highlight font-bold text-lg">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Certifications Section - Only show if data exists */}
            {specialist.certifications && specialist.certifications.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Certificações
                  </h2>
                  <ul className="space-y-3">
                    {specialist.certifications.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                        <span className="text-cta-highlight font-bold text-lg">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Achievements Section - Only show if data exists */}
            {specialist.achievements && specialist.achievements.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Conquistas
                  </h2>
                  <ul className="space-y-3">
                    {specialist.achievements.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                        <span className="text-cta-highlight font-bold text-lg">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Specialties Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Especialidades
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specialist.specialties.map((specialty, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-2 h-2 bg-cta-highlight rounded-full"></div>
                    <span className="text-gray-900 dark:text-white font-medium">{specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:-mt-52 relative z-10">
              <SpecialistInfo
                specialist={specialist}
                onContact={handleContact}
                onMessage={handleMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}