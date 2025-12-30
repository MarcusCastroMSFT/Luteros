'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Star, Clock, Mail, MessageCircle } from 'lucide-react';
import { type Specialist } from '@/types/specialist';

interface SpecialistInfoProps {
  specialist: Specialist;
  onContact?: () => void;
  onMessage?: () => void;
}

export function SpecialistInfo({ 
  specialist, 
  onContact,
  onMessage 
}: SpecialistInfoProps) {
  return (
    <div className="space-y-6">
      {/* Specialist Image and Basic Info */}
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="relative h-64 w-full">
            <Image
              src={specialist.avatar}
              alt={specialist.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
          
          <div className="p-6 space-y-4">
            {/* Name and Profession */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {specialist.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {specialist.profession}
              </p>
            </div>

            {/* Experience */}
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{specialist.experience}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {specialist.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({specialist.studentsCount} avaliações)
              </span>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {specialist.studentsCount}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Estudantes
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {specialist.coursesCount}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Cursos
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onContact}
                className="w-full bg-cta-highlight hover:bg-cta-highlight/90 text-white cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2" />
                Entrar em Contato
              </Button>
              
              <Button 
                onClick={onMessage}
                variant="outline"
                className="w-full cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Especialidades
          </h3>
          <div className="flex flex-wrap gap-2">
            {specialist.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs bg-cta-highlight/10 text-cta-highlight rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location - Only show if data exists */}
      {specialist.location && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Localização
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {specialist.location}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Languages - Only show if data exists */}
      {specialist.languages && specialist.languages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Idiomas
            </h3>
            <div className="flex flex-wrap gap-2">
              {specialist.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {language}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation Price - Only show if data exists */}
      {specialist.consultationPrice && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Consulta
            </h3>
            <p className="text-2xl font-bold text-cta-highlight">
              R$ {specialist.consultationPrice.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              por sessão
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
