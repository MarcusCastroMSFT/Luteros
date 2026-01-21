import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AudienceBadgeProps {
  /** The audience value. Can be "Médicos", "Público Geral", "doctors", "general", or any string */
  value: "Médicos" | "Público Geral" | "doctors" | "general" | string
  /** Additional CSS classes to apply to the badge */
  className?: string
  /** Custom text labels for different audience types */
  labels?: {
    doctors?: string
    general?: string
  }
}

/**
 * AudienceBadge component displays a badge indicating the target audience of an item.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <AudienceBadge value="Médicos" />
 * <AudienceBadge value="Público Geral" />
 * 
 * // With custom labels
 * <AudienceBadge value="doctors" labels={{ doctors: "Doctors", general: "General Public" }} />
 * 
 * // In a table cell
 * cell: ({ row }) => <AudienceBadge value={row.getValue("audience")} />
 * ```
 */
export function AudienceBadge({ value, className, labels }: AudienceBadgeProps) {
  const isDoctors = value === "Médicos" || 
                    value === "doctors" ||
                    value?.toLowerCase().includes("médicos") || 
                    value?.toLowerCase().includes("medicos") ||
                    value?.toLowerCase().includes("doctors")
  
  const isGeneral = value === "Público Geral" || 
                    value === "general" ||
                    value?.toLowerCase().includes("público geral") ||
                    value?.toLowerCase().includes("publico geral") ||
                    value?.toLowerCase().includes("general")
  
  const doctorsLabel = labels?.doctors || "Médicos"
  const generalLabel = labels?.general || "Público Geral"
  
  // Determine badge styling and text based on audience
  let badgeClasses: string
  let displayText: string
  
  if (isDoctors) {
    // Blue for doctors - works in light and dark mode
    badgeClasses = "bg-blue-100 text-blue-800 border-blue-200"
    displayText = doctorsLabel
  } else if (isGeneral) {
    // Gray for general public - works in light and dark mode
    badgeClasses = "bg-gray-100 text-gray-800 border-gray-200"
    displayText = generalLabel
  } else {
    // Fallback for unknown audience
    badgeClasses = "bg-gray-100 text-gray-800 border-gray-200"
    displayText = value
  }
  
  return (
    <Badge 
      variant="outline"
      className={cn(badgeClasses, className)}
    >
      {displayText}
    </Badge>
  )
}
