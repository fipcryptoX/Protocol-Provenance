"use client"

import { WeeklyReviewData } from "@/types"
import { Badge } from "@/components/ui/badge"

interface ReviewTooltipProps {
  weekData: WeeklyReviewData
  position: { x: number; y: number }
}

export function ReviewTooltip({ weekData, position }: ReviewTooltipProps) {
  const { reviewCount, sentiment } = weekData

  return (
    <div
      className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-3 pointer-events-none"
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y - 50}px`,
      }}
    >
      <div className="text-sm space-y-2">
        <p className="font-semibold text-slate-900">
          {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
        </p>
        <div className="flex gap-2">
          {sentiment.positive > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              {sentiment.positive} Positive
            </Badge>
          )}
          {sentiment.neutral > 0 && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              {sentiment.neutral} Neutral
            </Badge>
          )}
          {sentiment.negative > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              {sentiment.negative} Negative
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500">Click to view details</p>
      </div>
    </div>
  )
}
