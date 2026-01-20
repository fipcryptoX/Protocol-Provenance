"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboardStore, SortOption } from "@/lib/store"

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "ethos-desc", label: "Highest Ethos Score" },
  { value: "ethos-asc", label: "Lowest Ethos Score" },
  { value: "category", label: "Category (A-Z)" },
  { value: "stock-desc", label: "Highest Stock Metric" },
  { value: "flow-desc", label: "Highest Flow Metric" },
]

export function DashboardSort() {
  const { sortBy, setSortBy } = useDashboardStore()

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium whitespace-nowrap">Sort by:</label>
      <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
