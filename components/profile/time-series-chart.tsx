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
    // For flow (revenue), sum up the daily values to get weekly total
    data.forEach((point) => {
      const weekStart = Math.floor(point.timestamp / WEEK_IN_SECONDS) * WEEK_IN_SECONDS

      if (!weekMap.has(weekStart)) {
        const weekDate = new Date(weekStart * 1000)
        weekMap.set(weekStart, {
          week: weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weekTimestamp: weekStart,
          stockValue: point.stock,
          flowValue: point.flow || 0,
          reviewCount: 0,
          dominantSentiment: "NEUTRAL",
          sentiment: { positive: 0, neutral: 0, negative: 0 },
        })
      } else {
        // For stock metrics, use latest value; for flow metrics, sum up the week
        const weekPoint = weekMap.get(weekStart)!
        if (point.stock !== null) weekPoint.stockValue = point.stock
        if (point.flow !== null) weekPoint.flowValue = (weekPoint.flowValue || 0) + point.flow
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
    const { cx, cy, payload } = props

    if (!payload.reviewCount || payload.reviewCount === 0) {
      return <></>
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
      <g key={`dot-${payload.week}`}>
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
          fill="#64748b"
          fontSize="10"
          fontWeight="600"
          pointerEvents="none"
        >
          {payload.reviewCount}
        </text>

        {/* Larger invisible hit area for clicking - must be last (on top) */}
        <circle
          cx={cx}
          cy={cy}
          r={dotSize + 6}
          fill="transparent"
          stroke="transparent"
          style={{ cursor: "pointer" }}
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="week"
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#64748b" }}
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
                <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-sm min-w-[280px]">
                  <p className="font-semibold text-slate-900 mb-3">{payload.week}</p>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">{stockLabel}:</span>
                      <span className="text-slate-900 font-semibold">
                        {payload.stockValue !== null ? formatCurrency(payload.stockValue) : "N/A"}
                      </span>
                    </div>

                    {payload.flowValue !== null && payload.flowValue > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-600">{flowLabel}:</span>
                        <span className="text-slate-900 font-semibold">
                          {formatCurrency(payload.flowValue)}
                        </span>
                      </div>
                    )}

                    {payload.reviewCount > 0 && (
                      <>
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span className="text-slate-600">Reviews:</span>
                          <span className="text-slate-900 font-semibold">
                            {payload.reviewCount}
                          </span>
                        </div>

                        {/* Sentiment badges */}
                        <div className="flex gap-2 flex-wrap pt-1">
                          {payload.sentiment.positive > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs font-semibold text-green-700">
                                {payload.sentiment.positive} Positive
                              </span>
                            </div>
                          )}
                          {payload.sentiment.negative > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <span className="text-xs font-semibold text-red-700">
                                {payload.sentiment.negative} Negative
                              </span>
                            </div>
                          )}
                          {payload.sentiment.neutral > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              <span className="text-xs font-semibold text-yellow-700">
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
