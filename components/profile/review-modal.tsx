"use client"

import { useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { WeeklyReviewData, ChartDataPoint } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  weekData: WeeklyReviewData | null
  chartData: ChartDataPoint[]
  stockLabel: string
  flowLabel: string
}

export function ReviewModal({
  isOpen,
  onClose,
  weekData,
  chartData,
  stockLabel,
  flowLabel,
}: ReviewModalProps) {
  // Get metric snapshot for the week
  const metricSnapshot = useMemo(() => {
    if (!weekData) return null

    // Find the closest data point to the week start
    const dataPoint = chartData.find(
      (point) =>
        point.timestamp >= weekData.weekStart &&
        point.timestamp <= weekData.weekEnd
    )

    return dataPoint
  }, [weekData, chartData])

  // Sort reviews by author Ethos score (highest first)
  const sortedReviews = useMemo(() => {
    if (!weekData) return []
    return [...weekData.reviews].sort((a, b) => b.author.score - a.author.score)
  }, [weekData])

  if (!weekData) return null

  const getSentimentIcon = (sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE") => {
    switch (sentiment) {
      case "POSITIVE":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>
            <path d="M7 10v12"/>
          </svg>
        )
      case "NEGATIVE":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>
            <path d="M17 14V2"/>
          </svg>
        )
      case "NEUTRAL":
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" x2="16" y1="15" y2="15"/>
            <line x1="9" x2="9.01" y1="9" y2="9"/>
            <line x1="15" x2="15.01" y1="9" y2="9"/>
          </svg>
        )
    }
  }

  const getSentimentColor = (sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE") => {
    switch (sentiment) {
      case "POSITIVE":
        return "text-green-600 border-green-600"
      case "NEGATIVE":
        return "text-red-600 border-red-600"
      case "NEUTRAL":
      default:
        return "text-yellow-600 border-yellow-600"
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Reviews for{" "}
            {new Date(weekData.weekStart * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(weekData.weekEnd * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </DialogTitle>
          <DialogDescription>
            {weekData.reviewCount} {weekData.reviewCount === 1 ? "review" : "reviews"}{" "}
            during this period
          </DialogDescription>
        </DialogHeader>

        {/* Metric Snapshot */}
        {metricSnapshot && (
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-3">
              Metrics Snapshot
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {metricSnapshot.stock !== null && (
                <div>
                  <p className="text-sm text-slate-600">{stockLabel}</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(metricSnapshot.stock)}
                  </p>
                </div>
              )}
              {metricSnapshot.flow !== null && (
                <div>
                  <p className="text-sm text-slate-600">{flowLabel}</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(metricSnapshot.flow)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sentiment Summary */}
        <div className="flex gap-2 mb-4">
          {weekData.sentiment.positive > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              {weekData.sentiment.positive} Positive
            </Badge>
          )}
          {weekData.sentiment.neutral > 0 && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              {weekData.sentiment.neutral} Neutral
            </Badge>
          )}
          {weekData.sentiment.negative > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              {weekData.sentiment.negative} Negative
            </Badge>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <div
              key={review.id}
              className="border border-slate-200 rounded-lg p-4 space-y-3"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {review.author.avatarUrl ? (
                    <img
                      src={review.author.avatarUrl}
                      alt={review.author.displayName || "User"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-600 font-semibold">
                        {(review.author.displayName || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">
                      {review.author.displayName || review.author.username || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>Ethos Score: {review.author.score}</span>
                      <span>•</span>
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={getSentimentColor(review.reviewScore)}>
                  <span className="flex items-center gap-1">
                    {getSentimentIcon(review.reviewScore)}
                    {review.reviewScore}
                  </span>
                </Badge>
              </div>

              {/* Review Content */}
              <p className="text-slate-700 leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
