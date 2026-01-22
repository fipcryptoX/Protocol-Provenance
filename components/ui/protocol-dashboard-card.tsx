"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getEthosRank, getEthosColor } from "@/lib/ethos-ranking"

export interface ReviewDistribution {
  negative: number
  neutral: number
  positive: number
}

export interface MetricData {
  icon: string // base64 SVG data URL
  label: string
  value: number
  unit: string
}

export interface ProtocolDashboardCardProps {
  name: string
  avatarUrl?: string
  ethosScore: number
  category: string
  stockMetric: MetricData
  flowMetric: MetricData
  reviewDistribution: ReviewDistribution
  className?: string
}

export function ProtocolDashboardCard({
  name,
  avatarUrl,
  ethosScore,
  category,
  stockMetric,
  flowMetric,
  reviewDistribution,
  className,
}: ProtocolDashboardCardProps) {
  const router = useRouter()
  const ethosRank = getEthosRank(ethosScore)
  const ethosColor = getEthosColor(ethosScore)

  const formatValue = (value: number, unit: string): string => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`
    }
    return value.toFixed(2)
  }

  const handleClick = () => {
    const slug = name.toLowerCase().replace(/\s+/g, "-")
    router.push(`/profile/${slug}`)
  }

  // Calculate total reviews and percentages
  const totalReviews =
    reviewDistribution.negative +
    reviewDistribution.neutral +
    reviewDistribution.positive

  const negativePercent =
    totalReviews > 0 ? (reviewDistribution.negative / totalReviews) * 100 : 0
  const neutralPercent =
    totalReviews > 0 ? (reviewDistribution.neutral / totalReviews) * 100 : 0
  const positivePercent =
    totalReviews > 0 ? (reviewDistribution.positive / totalReviews) * 100 : 0

  return (
    <Card
      className={cn(
        "w-full max-w-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-4">
        {/* Top Section: Icon and Name */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: Protocol Icon */}
          {avatarUrl && (
            <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <img
                src={avatarUrl}
                alt={`${name} logo`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {/* Right: Protocol Name */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
          </div>
        </div>

        {/* Big Number: Ethos Score with Category Tag */}
        <div className="mt-4 flex items-start gap-3">
          <div>
            <div
              className="text-4xl font-bold"
              style={{ color: ethosColor }}
            >
              {ethosScore}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {ethosRank.rank}
            </div>
          </div>
          <Badge variant="secondary" className="mt-1">
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Metrics
          </h4>

          {/* Stock Metric */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
              <img
                src={stockMetric.icon}
                alt={stockMetric.label}
                className="h-5 w-5 opacity-70"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">
                {stockMetric.label}
              </div>
              <div className="text-sm font-semibold">
                {formatValue(stockMetric.value, stockMetric.unit)} {stockMetric.unit}
              </div>
            </div>
          </div>

          {/* Flow Metric */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
              <img
                src={flowMetric.icon}
                alt={flowMetric.label}
                className="h-5 w-5 opacity-70"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">
                {flowMetric.label}
              </div>
              <div className="text-sm font-semibold">
                {formatValue(flowMetric.value, flowMetric.unit)} {flowMetric.unit}
              </div>
            </div>
          </div>
        </div>

        {/* Review Distribution Bar */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Review Distribution
          </h4>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {negativePercent > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${negativePercent}%` }}
              />
            )}
            {neutralPercent > 0 && (
              <div
                className="bg-yellow-500"
                style={{ width: `${neutralPercent}%` }}
              />
            )}
            {positivePercent > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${positivePercent}%` }}
              />
            )}
          </div>

          {/* Review Counts */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>{reviewDistribution.negative}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>{reviewDistribution.neutral}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>{reviewDistribution.positive}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
