import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  /** The status value. Can be "Ativo", "Rascunho", "Inativo", "Suspenso", or any string */
  value: "Ativo" | "Rascunho" | "Inativo" | "Suspenso" | string
  /** Additional CSS classes to apply to the badge */
  className?: string
  /** Custom text labels for different status states */
  labels?: {
    active?: string
    draft?: string
    inactive?: string
    suspended?: string
  }
}

/**
 * StatusBadge component displays a badge indicating the status of an item.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <StatusBadge value="Ativo" />
 * <StatusBadge value="Rascunho" />
 * <StatusBadge value="Inativo" />
 * <StatusBadge value="Suspenso" />
 * 
 * // With custom labels
 * <StatusBadge value="Ativo" labels={{ active: "Active", draft: "Draft", inactive: "Inactive", suspended: "Suspended" }} />
 * 
 * // In a table cell
 * cell: ({ row }) => <StatusBadge value={row.getValue("status")} />
 * ```
 */
export function StatusBadge({ value, className, labels }: StatusBadgeProps) {
  const isActive = value === "Ativo" || 
                   value === "Active" ||
                   value?.toLowerCase().includes("ativo") || 
                   value?.toLowerCase().includes("active")
  
  const isDraft = value === "Rascunho" || 
                  value === "Draft" ||
                  value?.toLowerCase().includes("rascunho") || 
                  value?.toLowerCase().includes("draft")
  
  const isInactive = value === "Inativo" || 
                     value === "Inactive" ||
                     value?.toLowerCase().includes("inativo") || 
                     value?.toLowerCase().includes("inactive")
                     
  const isSuspended = value === "Suspenso" || 
                      value === "Suspended" ||
                      value?.toLowerCase().includes("suspenso") || 
                      value?.toLowerCase().includes("suspended")
  
  const activeLabel = labels?.active || "Ativo"
  const draftLabel = labels?.draft || "Rascunho"
  const inactiveLabel = labels?.inactive || "Inativo"
  const suspendedLabel = labels?.suspended || "Suspenso"
  
  // Determine badge styling and text based on status
  let badgeClasses: string
  let displayText: string
  
  if (isActive) {
    // Green for active - works in light and dark mode
    badgeClasses = "bg-green-100 text-green-800 border-green-200"
    displayText = activeLabel
  } else if (isDraft) {
    // Yellow/orange for draft - works in light and dark mode
    badgeClasses = "bg-yellow-100 text-yellow-800 border-yellow-200"
    displayText = draftLabel
  } else if (isSuspended) {
    // Red for suspended - works in light and dark mode
    badgeClasses = "bg-red-100 text-red-800 border-red-200"
    displayText = suspendedLabel
  } else if (isInactive) {
    // Gray for inactive - works in light and dark mode
    badgeClasses = "bg-gray-100 text-gray-800 border-gray-200"
    displayText = inactiveLabel
  } else {
    // Fallback for unknown status
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
