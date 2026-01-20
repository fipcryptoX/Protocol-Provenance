"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useDashboardStore } from "@/lib/store"

export function DashboardSearch() {
  const { searchQuery, setSearchQuery } = useDashboardStore()

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search protocols, categories, chains..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
