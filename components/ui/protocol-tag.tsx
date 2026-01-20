import { getProtocolTypeColor } from "@/lib/constants/colors"
import { cn } from "@/lib/utils"

interface ProtocolTagProps {
  type: string
  className?: string
}

export function ProtocolTag({ type, className }: ProtocolTagProps) {
  const color = getProtocolTypeColor(type)

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        className
      )}
      style={{
        backgroundColor: `${color.dark}20`,
        color: color.light,
        border: `1px solid ${color.dark}40`,
      }}
    >
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color.light }}
      />
      <span className="capitalize">{type}</span>
    </div>
  )
}

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const color = getProtocolTypeColor(category)

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        className
      )}
      style={{
        backgroundColor: `${color.dark}20`,
        color: color.light,
        border: `1px solid ${color.dark}40`,
      }}
    >
      <div
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color.light }}
      />
      {category}
    </div>
  )
}
