"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, ChevronUp, Play, FileText, Headphones, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourseSection, Lesson } from '@/types/course'
import { PreviewDialog } from './previewDialog'

interface CourseContentProps {
  sections: CourseSection[]
  totalSections?: number
  className?: string
  showAllSections?: boolean
  onLessonSelect?: (lesson: Lesson) => void
  currentLessonId?: string
  completedLessons?: Set<string>
  courseSlug?: string
}

interface LessonItemProps {
  lesson: Lesson
  onSelect?: (lesson: Lesson) => void
  isActive?: boolean
  isCompleted?: boolean
  courseSlug?: string
  onPreviewClick?: (lesson: Lesson) => void
}

const LessonTypeIcon = ({ type }: { type: Lesson['type'] }) => {
  const iconProps = { size: 16, className: "text-muted-foreground" }
  
  switch (type) {
    case 'video':
      return <Play {...iconProps} />
    case 'article':
      return <FileText {...iconProps} />
    case 'audio':
      return <Headphones {...iconProps} />
    default:
      return <Play {...iconProps} />
  }
}

const LessonItem = ({ lesson, onSelect, isActive, isCompleted, courseSlug, onPreviewClick }: LessonItemProps) => {
  const { title, duration, isPreview, type } = lesson
  const router = useRouter()
  const pathname = usePathname()
  
  const handleClick = () => {
    if (isPreview && pathname.includes('/courses/') && !pathname.includes('/lessons')) {
      // We're on the course page and this is a preview lesson - open in dialog
      onPreviewClick?.(lesson)
    } else if (onSelect) {
      // We're on the lessons page - use the existing lesson selection
      onSelect(lesson)
    } else if (courseSlug) {
      // Navigate to lessons page with this lesson
      router.push(`/courses/${courseSlug}/lessons?lesson=${lesson.id}`)
    }
  }
  
  return (
    <div 
      className={`flex items-center justify-between py-2.5 md:py-3 px-3 md:px-4 transition-colors cursor-pointer ${
        isActive 
          ? 'bg-brand-50 border-l-2 md:border-l-0 md:border-r-2 border-brand-500' 
          : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <LessonTypeIcon type={type} />
        <span className={`text-sm font-medium truncate ${
          isActive 
            ? 'text-brand-700' 
            : isCompleted
              ? 'text-gray-600'
              : 'text-gray-700'
        }`}>
          {title}
        </span>
        {isCompleted && (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={10} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 ml-2">
        <span className="text-xs md:text-sm text-gray-500">{duration}</span>
        
        {isPreview ? (
          <Badge variant="outline" className="text-brand-600 border-brand-200 bg-brand-50 text-[10px] md:text-xs px-1.5 md:px-2 py-0 md:py-0.5">
            Prévia
          </Badge>
        ) : (
          <Lock size={12} className="text-gray-400 md:w-3.5 md:h-3.5" />
        )}
      </div>
    </div>
  )
}

interface SectionProps {
  section: CourseSection
  isExpanded: boolean
  onToggle: () => void
  onLessonSelect?: (lesson: Lesson) => void
  currentLessonId?: string
  completedLessons?: Set<string>
  courseSlug?: string
  onPreviewClick?: (lesson: Lesson) => void
}

const SectionItem = ({ section, isExpanded, onToggle, onLessonSelect, currentLessonId, completedLessons, courseSlug, onPreviewClick }: SectionProps) => {
  const { title, lessons, totalDuration } = section
  const lessonsCount = lessons.length
  const completedCount = lessons.filter(l => completedLessons?.has(l.id)).length
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 md:px-4 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-400 shrink-0 md:w-5 md:h-5" />
          ) : (
            <ChevronDown size={18} className="text-gray-400 shrink-0 md:w-5 md:h-5" />
          )}
          <span className="font-medium text-gray-900 text-sm md:text-base truncate">{title}</span>
          {/* Section progress indicator */}
          {completedLessons && completedCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
              completedCount === lessonsCount 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {completedCount}/{lessonsCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 shrink-0 ml-2">
          <span className="hidden sm:inline">{lessonsCount} aula{lessonsCount !== 1 ? 's' : ''}</span>
          <span className="sm:hidden">{lessonsCount}</span>
          <span className="hidden sm:inline">•</span>
          <span>{totalDuration}</span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          {lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              onSelect={onLessonSelect}
              isActive={lesson.id === currentLessonId}
              isCompleted={completedLessons?.has(lesson.id)}
              courseSlug={courseSlug}
              onPreviewClick={onPreviewClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CourseContent({ 
  sections, 
  totalSections, 
  className, 
  showAllSections = false,
  onLessonSelect,
  currentLessonId,
  completedLessons,
  courseSlug 
}: CourseContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    showAllSections ? new Set(sections.map((_, index) => index)) : new Set([0])
  )
  const [showAllSectionsState, setShowAllSectionsState] = useState(showAllSections)
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  const handlePreviewClick = (lesson: Lesson) => {
    setPreviewLesson(lesson)
    setIsPreviewOpen(true)
  }
  
  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewLesson(null)
  }
  
  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }
  
  const handleShowMore = () => {
    setShowAllSectionsState(true)
  }
  
  const visibleSections = showAllSectionsState ? sections : sections.slice(0, 3)
  const remainingSections = Math.max(0, (totalSections || sections.length) - (showAllSectionsState ? sections.length : 3))
  
  return (
    <>
      <div className={className}>
        <div className="space-y-2 md:space-y-3 pt-4 md:pt-6">
          {visibleSections.map((section, index) => (
            <SectionItem
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(index)}
              onToggle={() => toggleSection(index)}
              onLessonSelect={onLessonSelect}
              currentLessonId={currentLessonId}
              completedLessons={completedLessons}
              courseSlug={courseSlug}
              onPreviewClick={handlePreviewClick}
            />
          ))}
          
          {!showAllSectionsState && remainingSections > 0 && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={handleShowMore}
                className="w-full text-brand-600 border-brand-200 hover:bg-brand-50"
              >
                {remainingSections} Mais Seções →
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <PreviewDialog
        lesson={previewLesson}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </>
  )
}
