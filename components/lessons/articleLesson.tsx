'use client';

import { useState } from 'react';
import { Lesson } from '@/types/course';
import { BookOpen, Type, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleLessonProps {
  lesson: Lesson;
}

export function ArticleLesson({ lesson }: ArticleLessonProps) {
  const [fontSize, setFontSize] = useState('base');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="space-y-6">
      {/* Article Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-gray-600" />
            <span className="text-sm text-gray-600">Tempo de leitura: {lesson.duration}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Type size={16} className="text-gray-600" />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded px-2 py-1 text-gray-900"
            >
              <option value="sm">Pequena</option>
              <option value="base">Normal</option>
              <option value="lg">Grande</option>
              <option value="xl">Extra Grande</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`${isBookmarked ? 'text-cta-highlight' : 'text-gray-600'}`}
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Share2 size={16} />
          </Button>
        </div>
      </div>

      {/* Article Content */}
      {lesson.content ? (
        <div className={`prose prose-gray max-w-none ${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]}`}>
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">Conteúdo indisponível.</p>
      )}

      {/* Article Notes Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          Anotações do Artigo
        </h3>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-cta-highlight focus:border-transparent"
          placeholder="Faça anotações enquanto lê este artigo..."
        />
      </div>

    </div>
  );
}
