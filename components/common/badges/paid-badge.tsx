import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PaidBadgeProps {
  /** The paid status value. Can be "Free", "Paid", "Gratuito", or any string */
  value: "Free" | "Paid" | string
  /** Additional CSS classes to apply to the badge */
  className?: string
  /** Custom text labels for free and paid states */
  labels?: {
    free?: string
    paid?: string
  }
}

/**
 * PaidBadge component displays a badge indicating whether something is free or paid.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <PaidBadge value="Free" />
 * <PaidBadge value="Paid" />
 * <PaidBadge value="Gratuito" />
 * 
 * // With custom labels
 * <PaidBadge value="Free" labels={{ free: "Grátis", paid: "Pago" }} />
 * 
 * // In a table cell
 * cell: ({ row }) => <PaidBadge value={row.getValue("paid")} />
 * ```
 */
export function PaidBadge({ value, className, labels }: PaidBadgeProps) {
  const isFree = value === "Free" || 
                 value === "Gratuito" || 
                 value?.toLowerCase().includes("gratuito") || 
                 value?.toLowerCase().includes("free")
  
  const freeLabel = labels?.free || "Gratuito"
  const paidLabel = labels?.paid || "Pago"
  
  // Custom colors that work well in both light and dark mode
  const badgeClasses = isFree 
    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
    : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800"
  
  return (
    <Badge 
      variant="outline"
      className={cn(badgeClasses, className)}
    >
      {isFree ? freeLabel : paidLabel}
    </Badge>
  )
}
