import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  name: string
  avatar?: string | null
  className?: string
}

/**
 * Reusable user avatar component with automatic initials fallback
 */
export function UserAvatar({ name, avatar, className }: UserAvatarProps) {
  // Get initials from name (first and last name only, skip middle names)
  const getInitials = (displayName: string) => {
    const parts = displayName.trim().split(' ').filter(p => p.length > 0)
    if (parts.length >= 2) {
      // Use first letter of first name and first letter of last name
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return displayName.substring(0, 2).toUpperCase()
  }
  
  const initials = getInitials(name)

  return (
    <Avatar className={className}>
      <AvatarImage src={avatar || undefined} alt={name} />
      <AvatarFallback className="rounded-lg bg-cta-highlight text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
