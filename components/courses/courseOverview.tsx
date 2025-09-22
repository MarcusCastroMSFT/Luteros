"use client"

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Course } from '@/types/course'

interface CourseOverviewProps {
  course: Course
  className?: string
}

const defaultLearningObjectives = [
  'Prepare for Industry Certification Exam',
  'Hours and Hours of Video Instruction', 
  'Over 25 Engaging Lab Exercises',
  'Instructor Available by Email or on the Forums',
  'Comprehensive Coverage of HTML and CSS',
  'Server Side Development with PHP',
  'Earn Certification that is Proof of your Competence',
  'Dozens of Code Examples to Download and Study',
  'All Lab Solutions',
  'All Free Tools',
  'Client Side Programming with Javascript',
  'Learn Database Development with mySQL'
]

const defaultRequirements = [
  'There are no skill prerequisites for this course although it\'s helpful if you are familiar with operating your internet.',
  'You can take this course using a Mac, PC or Linux machine.',
  'It is recommended that you download the free Komodo text editor.'
]

const defaultAboutCourse = `Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor inc idid unt ut labore et dolore magna aliqua enim ad minim veniam. quis nostrud exerc tation ullamco laboris nis aliquip commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur enim ipsam.

Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.`

export function CourseOverview({ course, className }: CourseOverviewProps) {
  const [showMoreAbout, setShowMoreAbout] = useState(false)
  
  const learningObjectives = course.learningObjectives || defaultLearningObjectives
  const requirements = course.requirements || defaultRequirements
  const aboutCourse = course.aboutCourse || defaultAboutCourse
  
  // Split objectives into two columns
  const midPoint = Math.ceil(learningObjectives.length / 2)
  const leftColumnObjectives = learningObjectives.slice(0, midPoint)
  const rightColumnObjectives = learningObjectives.slice(midPoint)
  
  const truncatedAbout = aboutCourse.split('\n')[0] // Show only first paragraph initially
  
  return (
    <div className={`space-y-8 ${className}`}>
      {/* What you'll learn section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          O que você vai aprender
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            {leftColumnObjectives.map((objective, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{objective}</span>
              </div>
            ))}
          </div>
          
          {/* Right Column */}
          <div className="space-y-3">
            {rightColumnObjectives.map((objective, index) => (
              <div key={index + midPoint} className="flex items-start gap-3">
                <Check size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{objective}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Requirements section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Requisitos
        </h2>
        
        <div className="space-y-3">
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{requirement}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* About This Course section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Sobre o Curso
        </h2>
        
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <div className="whitespace-pre-wrap">
            {showMoreAbout ? aboutCourse : truncatedAbout}
          </div>
          
          {aboutCourse.length > truncatedAbout.length && (
            <Button
              variant="link"
              onClick={() => setShowMoreAbout(!showMoreAbout)}
              className="cursor-pointer text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 p-0 h-auto font-normal mt-2 flex items-center gap-1"
            >
              {showMoreAbout ? 'Mostrar menos' : 'Mostrar mais'}
              {showMoreAbout ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
