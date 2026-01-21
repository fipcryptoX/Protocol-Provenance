"use client"

import { useMemo } from "react"
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ZAxis,
} from "recharts"
import { ChartDataPoint, WeeklyReviewData } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface TimeSeriesChartProps {
  data: ChartDataPoint[]
  stockLabel: string
  flowLabel: string
  reviewData: WeeklyReviewData[]
  onMarkerClick: (weekData: WeeklyReviewData) => void
  onMarkerHover: (weekData: WeeklyReviewData | null, event?: any) => void
}

export function TimeSeriesChart({
  data,
  stockLabel,
  flowLabel,
  reviewData,
  onMarkerClick,
  onMarkerHover,
}: TimeSeriesChartProps) {
  // Get sentiment color
  const getSentimentColor = (sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE") => {
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

  // Calculate marker size based on review count
  const getMarkerSize = (count: number) => {
    const baseSize = 8  // Increased from 6 for better visibility
    const maxSize = 24  // Increased from 20
    const scaleFactor = Math.log(count + 1) * 4  // Increased scaling
    return Math.min(baseSize + scaleFactor, maxSize)
  }

  // Format date for X-axis
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }

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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="text-slate-900 font-semibold">
              {entry.value !== null ? formatCurrency(entry.value) : "N/A"}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Create scatter data for review markers and a lookup map for fast access
  const { reviewMarkers, reviewMarkersByDate } = useMemo(() => {
    const markers = reviewData.map((weekData) => {
      // Find the closest data point for this week
      const dataPoint = data.find(
        (point) =>
          point.timestamp >= weekData.weekStart &&
          point.timestamp <= weekData.weekEnd
      )

      if (!dataPoint || dataPoint.stock === null) return null

      return {
        date: dataPoint.date,
        timestamp: weekData.weekStart,
        y: dataPoint.stock,
        reviewCount: weekData.reviewCount,
        sentiment: weekData.dominantSentiment,
        weekData,
      }
    }).filter(Boolean)

    // Create a Map for O(1) lookup instead of O(n) find
    const markerMap = new Map()
    markers.forEach(marker => {
      if (marker) markerMap.set(marker.date, marker)
    })

    return {
      reviewMarkers: markers,
      reviewMarkersByDate: markerMap
    }
  }, [data, reviewData])

  return (
    <div className="w-full h-[500px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {/* Define gradient for markers */}
            <filter id="marker-shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3"/>
            </filter>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="date"
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#64748b" }}
          />

          {/* Left Y-axis for Stock */}
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

          {/* Right Y-axis for Flow */}
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

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />

          {/* Stock metric line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="stock"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props
              if (!cx || !cy) return null

              // Fast O(1) lookup instead of O(n) find
              const weekData = reviewMarkersByDate.get(payload.date)
              if (!weekData) return null

              // Determine which sentiments to show (prioritize positive/negative over neutral)
              const { positive, neutral, negative } = weekData.weekData.sentiment
              const sentiments: Array<"POSITIVE" | "NEGATIVE" | "NEUTRAL"> = []

              // Add sentiments in priority order
              if (positive > 0) sentiments.push("POSITIVE")
              if (negative > 0) sentiments.push("NEGATIVE")
              if (neutral > 0 && sentiments.length < 2) sentiments.push("NEUTRAL")

              // Show up to 2 markers
              const markersToShow = sentiments.slice(0, 2)
              const totalReviews = weekData.reviewCount
              const showCounter = totalReviews > 2

              // Position markers above the line, stacked vertically
              const baseY = cy - 20
              const markerSpacing = 11 // Vertical spacing between markers

              return (
                <g key={`marker-${payload.date}`}>
                  {/* Render up to 2 markers stacked vertically */}
                  {markersToShow.map((sentiment, index) => {
                    const markerY = baseY - (index * markerSpacing)
                    const color = getSentimentColor(sentiment)

                    return (
                      <g key={`${payload.date}-${sentiment}-${index}`}>
                        {/* White background circle */}
                        <circle
                          cx={cx}
                          cy={markerY}
                          r={6}
                          fill="white"
                          filter="url(#marker-shadow)"
                          pointerEvents="none"
                        />
                        {/* Colored marker circle */}
                        <circle
                          cx={cx}
                          cy={markerY}
                          r={5}
                          fill={color}
                          stroke="white"
                          strokeWidth={1.5}
                          pointerEvents="none"
                        />
                      </g>
                    )
                  })}

                  {/* Counter badge if more than 2 reviews */}
                  {showCounter && (
                    <g>
                      {/* Badge background */}
                      <rect
                        x={cx - 12}
                        y={baseY - (markersToShow.length * markerSpacing) - 14}
                        width={24}
                        height={14}
                        rx={7}
                        fill="#64748b"
                        pointerEvents="none"
                      />
                      {/* Counter text */}
                      <text
                        x={cx}
                        y={baseY - (markersToShow.length * markerSpacing) - 6}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        fontWeight="600"
                        pointerEvents="none"
                      >
                        +{totalReviews - 2}
                      </text>
                    </g>
                  )}

                  {/* Invisible larger hit area for clicking */}
                  <circle
                    cx={cx}
                    cy={baseY - (markerSpacing / 2)}
                    r={22}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkerClick(weekData.weekData)
                    }}
                    onMouseEnter={(e: any) => {
                      e.stopPropagation()
                      onMarkerHover(weekData.weekData, e)
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation()
                      onMarkerHover(null)
                    }}
                  />
                </g>
              )
            }}
            name={stockLabel}
            connectNulls
          />

          {/* Flow metric line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="flow"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            name={flowLabel}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
