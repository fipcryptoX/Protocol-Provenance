"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MetricStatCard } from "@/components/ui/metric-stat-card"
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

  // Sentiment filter state
  const [sentimentFilter, setSentimentFilter] = useState<"ALL" | "POSITIVE" | "NEGATIVE" | "NEUTRAL">("ALL")

  // Sort and filter reviews
  const sortedReviews = useMemo(() => {
    if (!weekData) return []
    let filtered = [...weekData.reviews]

    // Apply sentiment filter
    if (sentimentFilter !== "ALL") {
      filtered = filtered.filter(review => review.reviewScore === sentimentFilter)
    }

    // Sort by Ethos score (highest first)
    return filtered.sort((a, b) => b.author.score - a.author.score)
  }, [weekData, sentimentFilter])

  if (!weekData) return null

  const getSentimentBadge = (sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE") => {
    switch (sentiment) {
      case "POSITIVE":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            Positive
          </Badge>
        )
      case "NEGATIVE":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            Negative
          </Badge>
        )
      case "NEUTRAL":
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
            Neutral
          </Badge>
        )
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

        {/* Metric Snapshot with Animated Cards */}
        {metricSnapshot && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {metricSnapshot.stock !== null && (
              <MetricStatCard
                title={stockLabel}
                value={metricSnapshot.stock}
                formatValue={formatCurrency}
              />
            )}
            {metricSnapshot.flow !== null && (
              <MetricStatCard
                title={flowLabel}
                value={metricSnapshot.flow}
                formatValue={formatCurrency}
              />
            )}
          </div>
        )}

        {/* Sentiment Filter */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">Filter by sentiment</p>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setSentimentFilter("ALL")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                sentimentFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({weekData.reviewCount})
            </button>
            {weekData.sentiment.positive > 0 && (
              <button
                onClick={() => setSentimentFilter("POSITIVE")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  sentimentFilter === "POSITIVE"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-slate-600 hover:text-green-700"
                }`}
              >
                Positive ({weekData.sentiment.positive})
              </button>
            )}
            {weekData.sentiment.neutral > 0 && (
              <button
                onClick={() => setSentimentFilter("NEUTRAL")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  sentimentFilter === "NEUTRAL"
                    ? "bg-white text-yellow-700 shadow-sm"
                    : "text-slate-600 hover:text-yellow-700"
                }`}
              >
                Neutral ({weekData.sentiment.neutral})
              </button>
            )}
            {weekData.sentiment.negative > 0 && (
              <button
                onClick={() => setSentimentFilter("NEGATIVE")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  sentimentFilter === "NEGATIVE"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-slate-600 hover:text-red-700"
                }`}
              >
                Negative ({weekData.sentiment.negative})
              </button>
            )}
          </div>
        </div>

        {/* Reviews Grid - Masonry-style responsive layout */}
        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
          {sortedReviews.map((review) => (
            <Card key={review.id} className="break-inside-avoid">
              <CardContent className="pt-6">
                <blockquote className="space-y-4">
                  {/* Header: Author Info and Sentiment Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="size-12">
                        <AvatarImage
                          src={review.author.avatarUrl || undefined}
                          alt={review.author.displayName || "User"}
                        />
                        <AvatarFallback className="bg-slate-200 text-slate-600 font-semibold">
                          {(review.author.displayName || review.author.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <cite className="text-sm font-medium not-italic text-slate-900">
                          {review.author.displayName || review.author.username || "Anonymous"}
                        </cite>
                        <span className="block text-sm text-slate-600">
                          {review.author.score} | {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Sentiment Badge */}
                    {getSentimentBadge(review.reviewScore)}
                  </div>

                  {/* Review Content */}
                  <p className="text-slate-700 leading-relaxed">{review.content}</p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
