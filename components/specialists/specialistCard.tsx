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
    <Link href={`/especialists/${specialist.slug}`}>
      <Card className="group hover:shadow-lg transition-all py-0 duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-[var(--cta-highlight)] overflow-hidden dark:bg-gray-800">
        <CardContent className="p-0">
          {/* Avatar Image - Full width */}
          <div className="relative w-full h-48 bg-gradient-to-br from-orange-100 to-pink-100">
            <Image
              src={specialist.avatar}
              alt={specialist.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Stats */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{specialist.studentsCount} Students</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{specialist.coursesCount} Course{specialist.coursesCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Name */}
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-[var(--cta-highlight)] transition-colors">
              {specialist.name}
            </h3>
            
            {/* Profession */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              {specialist.profession}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900 dark:text-white">{specialist.rating}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
