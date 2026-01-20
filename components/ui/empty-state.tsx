"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/lib/store"

export function EmptyState() {
  const { clearFilters, setSearchQuery } = useDashboardStore()

  const handleClearAll = () => {
    clearFilters()
    setSearchQuery("")
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No protocols match your filters</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Try adjusting your filters or clearing them to see more protocols.
      </p>
      <Button onClick={handleClearAll} variant="outline">
        Clear Filters
      </Button>
    </div>
  )
}
