import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Users, BookOpen } from 'lucide-react';
import { Specialist } from '@/types/specialist';
import { Card, CardContent } from '@/components/ui/card';

interface SpecialistCardProps {
  specialist: Specialist;
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  return (
    <Link href={`/specialists/${specialist.slug}`} className="cursor-pointer">
      <Card className="group hover:shadow-lg transition-all py-0 duration-300 cursor-pointer border border-gray-200 hover:border-cta-highlight overflow-hidden">
        <CardContent className="p-0">
          {/* Avatar Image - Full width */}
          <div className="relative w-full h-48 bg-gradient-to-br from-brand-100 to-brand-secondary-100">
            <Image
              src={specialist.avatar}
              alt={specialist.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Stats */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{specialist.studentsCount} Estudantes</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{specialist.coursesCount} Curso{specialist.coursesCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Name */}
            <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-cta-highlight transition-colors">
              {specialist.name}
            </h3>
            
            {/* Profession */}
            <p className="text-gray-600 text-sm mb-3">
              {specialist.profession}
            </p>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-3">
              {specialist.specialties.slice(0, 2).map((specialty, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                >
                  {specialty}
                </span>
              ))}
              {specialist.specialties.length > 2 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  +{specialist.specialties.length - 2}
                </span>
              )}
            </div>

            {/* Rating and Experience */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{specialist.rating}</span>
              </div>
              <span className="text-xs text-gray-500">{specialist.experience}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
