import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Specialist } from '@/types/specialist';

interface SpecialistAboutProps {
  specialist: Specialist;
}

export function SpecialistAbout({ specialist }: SpecialistAboutProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">About Me</h2>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            Maecenas rutrum semper mauris et viverra. Etiam tellus nisi, aliquet vitae lobortis a, faucibus et lorem. Nam et interdum lectus. Cras efficitur, leo vel sodales bibendum, mauris purus blandit lorem, bibendum maximus dolor nunc et ipsum.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Morbi dictum tortor ut mauris imperdiet, sit amet laoreet ante faucibus. Pellentesque elit est, semper a auctor in, suscipit vel leo. Ut et posuere tellus. Nullam risus magna, molestie sed gravida sed, ultricies rutrum felis. Nam quis tempor elit. Praesent ante felis, dignissim eu pretium vitae, feugiat non mauris.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-8">
            Vestibulum pellentesque risus vel blandit aliquet. Mauris molestie, mi eu dapibus gravida, lorem urna lobortis leo, et tempor ante magna a tellus. Donec at posuere nulla. Pellentesque feugiat maximus leo, vel efficitur felis tempor sed. Cras molestie nunc ipsum, ut cursus massa bibendum a.
          </p>
        </div>

        {/* Specialties */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expertise Areas</h3>
          <div className="flex flex-wrap gap-2">
            {specialist.specialties.map((specialty: string) => (
              <Badge 
                key={specialty} 
                variant="secondary"
                className="bg-[var(--cta-highlight)]/10 text-[var(--cta-highlight)] hover:bg-[var(--cta-highlight)]/20"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
