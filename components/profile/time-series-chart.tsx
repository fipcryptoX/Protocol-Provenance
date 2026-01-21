"use client"

import { useMemo } from "react"
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
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
    const baseSize = 6
    const maxSize = 20
    const scaleFactor = Math.log(count + 1) * 3
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

  // Merge review markers with chart data for positioning
  const chartDataWithMarkers = useMemo(() => {
    return data.map((point) => {
      const weekData = reviewData.find(
        (week) => point.timestamp >= week.weekStart && point.timestamp <= week.weekEnd
      )
      return {
        ...point,
        hasReviews: !!weekData,
        reviewData: weekData,
      }
    })
  }, [data, reviewData])

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartDataWithMarkers}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
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
            dot={false}
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

          {/* Review markers */}
          {reviewData.map((weekData) => {
            // Find the closest data point to the week start
            const dataPoint = data.find(
              (point) =>
                point.timestamp >= weekData.weekStart &&
                point.timestamp <= weekData.weekEnd
            )

            if (!dataPoint || dataPoint.stock === null) return null

            return (
              <ReferenceDot
                key={weekData.weekStart}
                x={dataPoint.date}
                y={dataPoint.stock}
                yAxisId="left"
                r={getMarkerSize(weekData.reviewCount)}
                fill={getSentimentColor(weekData.dominantSentiment)}
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onClick={() => onMarkerClick(weekData)}
                onMouseEnter={(e) => onMarkerHover(weekData, e)}
                onMouseLeave={() => onMarkerHover(null)}
              />
            )
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
