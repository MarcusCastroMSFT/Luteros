import React from 'react';
import Image from 'next/image';

export interface Speaker {
  id: string;
  name: string;
  title: string;
  image: string;
  bio?: string;
}

interface SpeakersProps {
  speakers: Speaker[];
  title?: string;
  className?: string;
}

export function Speakers({ speakers, title = "Palestrantes do Evento", className = "" }: SpeakersProps) {
  if (speakers.length === 0) return null;

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {speakers.map((speaker) => (
          <div key={speaker.id} className="text-center">
            <div className="relative w-36 h-36 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-brand-secondary-200 to-brand-200">
              <Image
                src={speaker.image}
                alt={speaker.name}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {speaker.name}
            </h3>
            <p className="text-sm text-gray-600">
              {speaker.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
