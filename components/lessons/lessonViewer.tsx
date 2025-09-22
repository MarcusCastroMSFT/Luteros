'use client';

import { Lesson } from '@/types/course';
import { VideoLesson } from './videoLesson';
import { ArticleLesson } from './articleLesson';
import { AudioLesson } from './audioLesson';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
  onNavigate: (direction: 'previous' | 'next') => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}

export function LessonViewer({
  lesson,
  isCompleted,
  onMarkComplete,
  onMarkIncomplete,
  onNavigate,
  canNavigatePrevious,
  canNavigateNext,
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
            <div className="text-gray-600 dark:text-gray-400">
              Unsupported lesson type: {lesson.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Lesson Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {lesson.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {lesson.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">{lesson.type}</span>
              <span>•</span>
              <span>{lesson.duration}</span>
            </div>
          </div>
          
          {/* Complete/Incomplete Button */}
          <Button
            onClick={isCompleted ? onMarkIncomplete : onMarkComplete}
            variant={isCompleted ? "default" : "outline"}
            className={`flex items-center gap-2 cursor-pointer ${
              isCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle size={16} />
                Concluída
              </>
            ) : (
              <>
                <Circle size={16} />
                Marcar como Concluída
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6">
        {renderLessonContent()}
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => onNavigate('previous')}
            disabled={!canNavigatePrevious}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ChevronLeft size={16} />
            Aula Anterior
          </Button>

          <Button
            onClick={() => onNavigate('next')}
            disabled={!canNavigateNext}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
          >
            Próxima Aula
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
