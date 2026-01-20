"use client"

interface DashboardStatsProps {
  totalCount: number
  filteredCount: number
  isLoading: boolean
}

export function DashboardStats({
  totalCount,
  filteredCount,
  isLoading,
}: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground px-4 py-2">
        Loading protocols...
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground px-4 py-2">
      Showing <span className="font-semibold text-foreground">{filteredCount}</span> of{" "}
      <span className="font-semibold text-foreground">{totalCount}</span> protocols
    </div>
  )
}
