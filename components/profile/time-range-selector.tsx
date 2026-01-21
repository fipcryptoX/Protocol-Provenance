"use client"

import { TimeRange } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimeRangeSelectorProps {
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
  className?: string
}

const TIME_RANGES: TimeRange[] = ["1Y"]

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {TIME_RANGES.map((range) => (
        <Button
          key={range}
          variant={selectedRange === range ? "default" : "outline"}
          size="sm"
          onClick={() => onRangeChange(range)}
          className={cn(
            "min-w-[60px]",
            selectedRange === range && "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          {range}
        </Button>
      ))}
    </div>
  )
}
