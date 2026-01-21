import Image from 'next/image'
import { Star, Users, BookOpen } from 'lucide-react'
import { IconBrandFacebook, IconBrandInstagram, IconBrandLinkedin, IconWorld } from '@tabler/icons-react'
import { Instructor } from '@/types/course'

interface InstructorCardProps {
  instructor: Instructor
  className?: string
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}k` 
  }
  return num.toString()
}

const getSocialIcon = (platform: string) => {
  const iconProps = { size: 16, className: "text-muted-foreground hover:text-primary transition-colors" }
  
  if (platform.includes('linkedin')) return <IconBrandLinkedin {...iconProps} />
  if (platform.includes('instagram')) return <IconBrandInstagram {...iconProps} />
  if (platform.includes('facebook')) return <IconBrandFacebook {...iconProps} />
  return <IconWorld {...iconProps} />
}

export function InstructorCard({ instructor, className }: InstructorCardProps) {
  const {
    name,
    title,
    bio,
    image,
    rating,
    reviewsCount,
    studentsCount,
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
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{rating}</span>
                <span>Avaliação</span>
              </div>
              
              {/* Reviews */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-400" />
                <span>{formatNumber(reviewsCount)} Avaliações</span>
              </div>
              
              {/* Students */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{formatNumber(studentsCount)} Estudantes</span>
              </div>
              
              {/* Courses */}
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span>{coursesCount} Curso{coursesCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
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
