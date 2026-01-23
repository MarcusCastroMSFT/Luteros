'use client';

import { Lesson } from '@/types/course';
import { VideoLesson } from './videoLesson';
import { ArticleLesson } from './articleLesson';
import { AudioLesson } from './audioLesson';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Play, FileText, Headphones } from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
  onNavigate: (direction: 'previous' | 'next') => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  currentIndex?: number;
  totalLessons?: number;
}

const LessonTypeIcon = ({ type }: { type: Lesson['type'] }) => {
  switch (type) {
    case 'video':
      return <Play size={14} />;
    case 'article':
      return <FileText size={14} />;
    case 'audio':
      return <Headphones size={14} />;
    default:
      return <Play size={14} />;
  }
};

export function LessonViewer({
  lesson,
  isCompleted,
  onMarkComplete,
  onMarkIncomplete,
  onNavigate,
  canNavigatePrevious,
  canNavigateNext,
  currentIndex = 0,
  totalLessons = 1,
}: LessonViewerProps) {
  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return <VideoLesson lesson={lesson} />;
      case 'article':
        return <ArticleLesson lesson={lesson} />;
      case 'audio':
        return <AudioLesson lesson={lesson} />;
      default:
        return (
          <div className="text-center py-8">
            <div className="text-gray-600">
              Unsupported lesson type: {lesson.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Lesson Header - Mobile optimized */}
      <div className="border-b border-gray-200 p-4 md:p-6">
        {/* Lesson Number and Type - Mobile */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="flex items-center gap-1.5">
            <LessonTypeIcon type={lesson.type} />
            <span className="capitalize">{lesson.type === 'video' ? 'Vídeo' : lesson.type === 'article' ? 'Artigo' : 'Áudio'}</span>
          </span>
          <span>•</span>
          <span>Aula {currentIndex + 1} de {totalLessons}</span>
          <span>•</span>
          <span>{lesson.duration}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-sm md:text-base text-gray-600 line-clamp-2 md:line-clamp-none">
                {lesson.description}
              </p>
            )}
          </div>
          
          {/* Complete Button - Smaller on mobile */}
          <Button
            onClick={isCompleted ? onMarkIncomplete : onMarkComplete}
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            className={`cursor-pointer shrink-0 ${
              isCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'text-gray-600 border-gray-300'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle size={16} className="mr-1.5" />
                <span className="hidden sm:inline">Concluída</span>
                <span className="sm:hidden">✓</span>
              </>
            ) : (
              <>
                <Circle size={16} className="mr-1.5" />
                <span className="hidden sm:inline">Marcar Concluída</span>
                <span className="sm:hidden">Concluir</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-4 md:p-6">
        {renderLessonContent()}
      </div>

      {/* Navigation Footer - Sticky on mobile */}
      <div className="border-t border-gray-200 p-3 md:p-6 bg-gray-50 sticky bottom-0">
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => onNavigate('previous')}
            disabled={!canNavigatePrevious}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 md:gap-2 cursor-pointer flex-1 sm:flex-none justify-center"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Aula Anterior</span>
            <span className="sm:hidden">Anterior</span>
          </Button>

          {/* Progress indicator - Mobile only */}
          <div className="hidden xs:flex sm:hidden items-center gap-1">
            {Array.from({ length: Math.min(totalLessons, 5) }).map((_, i) => {
              const lessonIndex = totalLessons <= 5 ? i : 
                currentIndex <= 2 ? i : 
                currentIndex >= totalLessons - 3 ? totalLessons - 5 + i : 
                currentIndex - 2 + i;
              return (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    lessonIndex === currentIndex 
                      ? 'bg-brand-600' 
                      : lessonIndex < currentIndex 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>

          <Button
            onClick={() => onNavigate('next')}
            disabled={!canNavigateNext}
            variant={canNavigateNext ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1 md:gap-2 cursor-pointer flex-1 sm:flex-none justify-center"
          >
            <span className="hidden sm:inline">Próxima Aula</span>
            <span className="sm:hidden">Próxima</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
