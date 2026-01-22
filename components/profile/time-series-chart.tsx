"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartDataPoint, WeeklyReviewData } from "@/types"
import { formatCurrency } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"

interface TimeSeriesChartProps {
  data: ChartDataPoint[]
  stockLabel: string
  flowLabel: string
  reviewData: WeeklyReviewData[]
  onMarkerClick: (weekData: WeeklyReviewData) => void
  onMarkerHover: (weekData: WeeklyReviewData | null, event?: any) => void
}

interface WeeklyDataPoint {
  week: string
  weekTimestamp: number
  stockValue: number | null
  flowValue: number | null
  reviewCount: number
  dominantSentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"
  sentiment: { positive: number; neutral: number; negative: number }
  weekData?: WeeklyReviewData
}

export function TimeSeriesChart({
  data,
  stockLabel,
  flowLabel,
  reviewData,
  onMarkerClick,
  onMarkerHover,
}: TimeSeriesChartProps) {
  // Aggregate data by week
  const weeklyData = useMemo((): WeeklyDataPoint[] => {
    // Create a map of weeks
    const WEEK_IN_SECONDS = 7 * 24 * 60 * 60
    const weekMap = new Map<number, WeeklyDataPoint>()

    // First pass: aggregate stock and flow data by week
    // For both stock and flow metrics, use the latest value in the week
    // (Flow data from DefiLlama already represents 7-day rolling values)
    data.forEach((point) => {
      const weekStart = Math.floor(point.timestamp / WEEK_IN_SECONDS) * WEEK_IN_SECONDS

      if (!weekMap.has(weekStart)) {
        const weekDate = new Date(weekStart * 1000)
        weekMap.set(weekStart, {
          week: weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weekTimestamp: weekStart,
          stockValue: point.stock,
          flowValue: point.flow || null,
          reviewCount: 0,
          dominantSentiment: "NEUTRAL",
          sentiment: { positive: 0, neutral: 0, negative: 0 },
        })
      } else {
        // For both stock and flow metrics, use the latest (most recent) value
        const weekPoint = weekMap.get(weekStart)!
        if (point.stock !== null) weekPoint.stockValue = point.stock
        if (point.flow !== null) weekPoint.flowValue = point.flow
      }
    })

    // Second pass: add review data
    reviewData.forEach((review) => {
      const weekStart = Math.floor(review.weekStart / WEEK_IN_SECONDS) * WEEK_IN_SECONDS
      const weekPoint = weekMap.get(weekStart)

      if (weekPoint) {
        weekPoint.reviewCount = review.reviewCount
        weekPoint.dominantSentiment = review.dominantSentiment
        weekPoint.sentiment = review.sentiment
        weekPoint.weekData = review
      }
    })

    return Array.from(weekMap.values()).sort((a, b) => a.weekTimestamp - b.weekTimestamp)
  }, [data, reviewData])

  // Format large numbers for Y-axis
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(0)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`
    }
    return `$${value}`
  }

  // Get dot color based on dominant sentiment
  const getDotColor = (sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL") => {
    switch (sentiment) {
      case "POSITIVE":
        return "#22c55e" // green-500
      case "NEGATIVE":
        return "#ef4444" // red-500
      case "NEUTRAL":
      default:
        return "#eab308" // yellow-500
    }
  }

  // Get outline colors for mixed sentiments
  const getOutlineColor = (weekPoint: WeeklyDataPoint) => {
    const { positive, neutral, negative } = weekPoint.sentiment

    // If predominantly positive
    if (positive > negative && positive > neutral) {
      if (negative > 0) return "#ef4444" // Show red outline if there are negatives
      if (neutral > 0) return "#eab308" // Show yellow outline if there are neutrals
    }

    // If predominantly negative
    if (negative > positive && negative > neutral) {
      if (positive > 0) return "#22c55e" // Show green outline if there are positives
      if (neutral > 0) return "#eab308" // Show yellow outline if there are neutrals
    }

    return null
  }

  const chartConfig = {
    stock: {
      label: stockLabel,
      color: "#3b82f6",
    },
    flow: {
      label: flowLabel,
      color: "#f97316",
    },
  } satisfies ChartConfig

  // Custom dot renderer
  const renderDot = (props: any) => {
    const { cx, cy, payload, index } = props

    if (!payload.reviewCount || payload.reviewCount === 0) {
      return false
    }

    const primaryColor = getDotColor(payload.dominantSentiment)
    const outlineColor = getOutlineColor(payload)

    // Better proportional sizing: base size + linear scaling with cap
    // Min size: 4px, Max size: 14px
    const minSize = 4
    const maxSize = 14
    const maxReviewCount = Math.max(...reviewData.map(r => r.reviewCount))
    const sizeRange = maxSize - minSize
    const dotSize = minSize + (payload.reviewCount / maxReviewCount) * sizeRange

    return (
      <g key={`dot-${payload.week}-${index}`} style={{ pointerEvents: 'all' }}>
        {/* Outer circle for mixed sentiment outline */}
        {outlineColor && (
          <circle
            cx={cx}
            cy={cy}
            r={dotSize + 2}
            fill={outlineColor}
            opacity={0.5}
            pointerEvents="none"
          />
        )}

        {/* Main sentiment dot */}
        <circle
          cx={cx}
          cy={cy}
          r={dotSize}
          fill={primaryColor}
          stroke="white"
          strokeWidth={2}
          pointerEvents="none"
        />

        {/* Review count text */}
        <text
          x={cx}
          y={cy + dotSize + 12}
          textAnchor="middle"
          className="fill-slate-600 dark:fill-slate-400"
          fontSize="10"
          fontWeight="600"
          pointerEvents="none"
        >
          {payload.reviewCount}
        </text>

        {/* Larger invisible hit area for clicking - must be last (on top) */}
        {/* Use a minimum radius of 18px to ensure even tiny dots are easily clickable */}
        <circle
          cx={cx}
          cy={cy}
          r={Math.max(18, dotSize + 6)}
          fill="transparent"
          stroke="transparent"
          style={{ cursor: "pointer", pointerEvents: 'all' }}
          onClick={(e) => {
            e.stopPropagation()
            payload.weekData && onMarkerClick(payload.weekData)
          }}
          onMouseEnter={(e: any) => {
            e.stopPropagation()
            payload.weekData && onMarkerHover(payload.weekData, e)
          }}
          onMouseLeave={(e) => {
            e.stopPropagation()
            onMarkerHover(null)
          }}
        />
      </g>
    )
  }

  return (
    <div className="w-full">
      <ChartContainer config={chartConfig} className="h-[600px] w-full">
        <LineChart
          data={weeklyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />

          <XAxis
            dataKey="week"
            className="stroke-slate-500 dark:stroke-slate-400"
            style={{ fontSize: "12px" }}
            tick={{ className: "fill-slate-600 dark:fill-slate-400" }}
          />

          <YAxis
            yAxisId="left"
            stroke="#3b82f6"
            tickFormatter={formatYAxis}
            style={{ fontSize: "12px" }}
            tick={{ fill: "#3b82f6" }}
            label={{
              value: stockLabel,
              angle: -90,
              position: "insideLeft",
              style: { fill: "#3b82f6", fontWeight: 600 },
            }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#f97316"
            tickFormatter={formatYAxis}
            style={{ fontSize: "12px" }}
            tick={{ fill: "#f97316" }}
            label={{
              value: flowLabel,
              angle: 90,
              position: "insideRight",
              style: { fill: "#f97316", fontWeight: 600 },
            }}
          />

          <ChartTooltip
            content={(props) => {
              if (!props.active || !props.payload || props.payload.length === 0) {
                return null
              }

              const payload = props.payload[0].payload as WeeklyDataPoint

              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 text-sm min-w-[280px]">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-3">{payload.week}</p>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600 dark:text-slate-400">{stockLabel}:</span>
                      <span className="text-slate-900 dark:text-slate-100 font-semibold">
                        {payload.stockValue !== null ? formatCurrency(payload.stockValue) : "N/A"}
                      </span>
                    </div>

                    {payload.flowValue !== null && payload.flowValue > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-600 dark:text-slate-400">{flowLabel}:</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">
                          {formatCurrency(payload.flowValue)}
                        </span>
                      </div>
                    )}

                    {payload.reviewCount > 0 && (
                      <>
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span className="text-slate-600 dark:text-slate-400">Reviews:</span>
                          <span className="text-slate-900 dark:text-slate-100 font-semibold">
                            {payload.reviewCount}
                          </span>
                        </div>

                        {/* Sentiment badges */}
                        <div className="flex gap-2 flex-wrap pt-1">
                          {payload.sentiment.positive > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                {payload.sentiment.positive} Positive
                              </span>
                            </div>
                          )}
                          {payload.sentiment.negative > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                {payload.sentiment.negative} Negative
                              </span>
                            </div>
                          )}
                          {payload.sentiment.neutral > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                                {payload.sentiment.neutral} Neutral
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="stockValue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={renderDot}
            activeDot={false}
            connectNulls
            name={stockLabel}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="flowValue"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            connectNulls
            name={flowLabel}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
