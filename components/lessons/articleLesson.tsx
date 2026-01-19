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

  // Sample article content - in a real app, this would come from your lesson data
  const articleContent = `
    <h2>Introduction to the Topic</h2>
    <p>This comprehensive lesson will guide you through the fundamental concepts and practical applications. Understanding these principles is crucial for mastering the subject matter.</p>
    
    <h3>Key Concepts</h3>
    <p>Before diving into the practical aspects, let's establish a solid foundation by exploring the core concepts:</p>
    
    <ul>
      <li><strong>Concept 1:</strong> Fundamental principle that forms the basis of understanding</li>
      <li><strong>Concept 2:</strong> Advanced technique that builds upon the foundation</li>
      <li><strong>Concept 3:</strong> Practical application in real-world scenarios</li>
    </ul>
    
    <h3>Practical Examples</h3>
    <p>Now that we've covered the theoretical foundation, let's explore some practical examples that demonstrate these concepts in action.</p>
    
    <blockquote>
      <p>"The best way to learn is through practice and real-world application of theoretical knowledge."</p>
    </blockquote>
    
    <h3>Step-by-Step Process</h3>
    <ol>
      <li>Begin by analyzing the problem or challenge</li>
      <li>Apply the theoretical concepts we've discussed</li>
      <li>Implement the solution using best practices</li>
      <li>Test and validate the results</li>
      <li>Iterate and improve based on feedback</li>
    </ol>
    
    <h3>Common Pitfalls to Avoid</h3>
    <p>As you progress through this material, be aware of these common mistakes:</p>
    
    <ul>
      <li>Rushing through the fundamentals without proper understanding</li>
      <li>Skipping the practice exercises</li>
      <li>Not reviewing previous lessons when needed</li>
    </ul>
    
    <h3>Conclusion</h3>
    <p>By the end of this lesson, you should have a solid understanding of the concepts and be ready to apply them in practical scenarios. Remember to practice regularly and don't hesitate to review this material as needed.</p>
  `;

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="space-y-6">
      {/* Article Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tempo de leitura: {lesson.duration}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Type size={16} className="text-gray-600 dark:text-gray-400" />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white"
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
            className={`${isBookmarked ? 'text-cta-highlight dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
            <Share2 size={16} />
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <div className={`prose prose-gray dark:prose-invert max-w-none ${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]}`}>
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: articleContent }}
        />
      </div>

      {/* Article Notes Section */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Anotações do Artigo
        </h3>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-cta-highlight focus:border-transparent"
          placeholder="Faça anotações enquanto lê este artigo..."
        />
      </div>

      {/* Article Summary */}
      <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-4 border border-brand-200 dark:border-brand-700">
        <h3 className="font-semibold text-brand-800 dark:text-brand-200 mb-2">
          Pontos Principais
        </h3>
        <ul className="text-brand-700 dark:text-brand-300 text-sm space-y-1">
          <li>• Domine os conceitos fundamentais antes de avançar para tópicos mais complexos</li>
          <li>• Pratique regularmente com exemplos do mundo real</li>
          <li>• Evite armadilhas comuns seguindo as melhores práticas</li>
          <li>• Revise e repita para melhorar o entendimento</li>
        </ul>
      </div>
    </div>
  );
}
