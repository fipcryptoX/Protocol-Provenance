"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/lib/store"
import { X } from "lucide-react"

const CATEGORIES = [
  "All Categories",
  "Chains",
  "Lending",
  "Liquid Staking",
  "Bridge",
  "Canonical Bridge",
  "Restaking",
  "RWA",
  "DEX",
  "Perps",
  "Stablecoin Apps",
]

export function DashboardFilters() {
  const {
    filters,
    setEthosMin,
    setEthosMax,
    setCategory,
    setStockMin,
    setStockMax,
    setFlowMin,
    setFlowMax,
    clearFilters,
  } = useDashboardStore()

  const hasActiveFilters =
    filters.ethosMin > 0 ||
    filters.ethosMax < Infinity ||
    filters.category !== null ||
    filters.stockMin > 0 ||
    filters.stockMax < Infinity ||
    filters.flowMin > 0 ||
    filters.flowMax < Infinity

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border-b">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Category:</label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) => setCategory(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem
                key={cat}
                value={cat === "All Categories" ? "all" : cat}
              >
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ethos Score Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Ethos:</label>
        <Input
          type="number"
          placeholder="Min"
          value={filters.ethosMin || ""}
          onChange={(e) =>
            setEthosMin(e.target.value ? parseFloat(e.target.value) : 0)
          }
          className="w-24"
          min={0}
        />
        <span className="text-sm text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="Max"
          value={filters.ethosMax === Infinity ? "" : filters.ethosMax}
          onChange={(e) =>
            setEthosMax(e.target.value ? parseFloat(e.target.value) : Infinity)
          }
          className="w-24"
          min={0}
        />
      </div>

      {/* Stock Metric Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Stock:</label>
        <Input
          type="number"
          placeholder="Min ($)"
          value={filters.stockMin || ""}
          onChange={(e) =>
            setStockMin(e.target.value ? parseFloat(e.target.value) : 0)
          }
          className="w-32"
          min={0}
        />
        <span className="text-sm text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="Max ($)"
          value={filters.stockMax === Infinity ? "" : filters.stockMax}
          onChange={(e) =>
            setStockMax(e.target.value ? parseFloat(e.target.value) : Infinity)
          }
          className="w-32"
          min={0}
        />
      </div>

      {/* Flow Metric Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Flow:</label>
        <Input
          type="number"
          placeholder="Min ($)"
          value={filters.flowMin || ""}
          onChange={(e) =>
            setFlowMin(e.target.value ? parseFloat(e.target.value) : 0)
          }
          className="w-32"
          min={0}
        />
        <span className="text-sm text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="Max ($)"
          value={filters.flowMax === Infinity ? "" : filters.flowMax}
          onChange={(e) =>
            setFlowMax(e.target.value ? parseFloat(e.target.value) : Infinity)
          }
          className="w-32"
          min={0}
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="ml-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
