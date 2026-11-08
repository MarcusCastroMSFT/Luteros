import Image from 'next/image'
import { BookOpen, Facebook, Instagram, Linkedin, Globe } from 'lucide-react'
import { Instructor } from '@/types/course'

interface InstructorCardProps {
  instructor: Instructor
  className?: string
}

const getSocialIcon = (platform: string) => {
  const iconProps = { size: 16, className: "text-muted-foreground hover:text-primary transition-colors" }

  if (platform.includes('linkedin')) return <Linkedin {...iconProps} />
  if (platform.includes('instagram')) return <Instagram {...iconProps} />
  if (platform.includes('facebook')) return <Facebook {...iconProps} />
  return <Globe {...iconProps} />
}

export function InstructorCard({ instructor, className }: InstructorCardProps) {
  const {
    name,
    title,
    bio,
    image,
    coursesCount,
    socialLinks
  } = instructor

  return (
    <div className={`cursor-pointer ${className}`}>
        <div className="flex gap-6 items-start">
          {/* Instructor Image */}
          <div className="flex-shrink-0">
            <div className="relative w-58 h-58 rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                sizes="232px"
              />
            </div>
          </div>
          
          {/* Instructor Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {name}
            </h3>
            
            <p className="text-base text-gray-600 mb-4">
              {title}
            </p>
            
            {/* Courses */}
            {coursesCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span>{coursesCount} Curso{coursesCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {/* Bio Section */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {bio}
            </p>
            
            {/* Social Links */}
            {socialLinks && Object.keys(socialLinks).length > 0 && (
              <div className="flex items-center gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {getSocialIcon(url)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
