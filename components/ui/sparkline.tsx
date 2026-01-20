"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Skeleton } from "./skeleton"

interface SparklineProps {
  data?: Array<{ date: number; value: number }>
  isLoading?: boolean
}

export function Sparkline({ data, isLoading }: SparklineProps) {
  // Show skeleton while loading or if no data
  if (isLoading || !data || data.length === 0) {
    return <Skeleton className="h-12 w-full" />
  }

  // Filter out invalid data points and transform for Recharts
  const chartData = data
    .filter((point) => point && typeof point.value === 'number' && !isNaN(point.value))
    .map((point) => ({
      value: point.value,
    }))

  // If all data was filtered out, show skeleton
  if (chartData.length === 0) {
    return <Skeleton className="h-12 w-full" />
  }

  // Determine line color based on trend (first vs last value)
  const isPositive = chartData[chartData.length - 1].value >= chartData[0].value
  const lineColor = isPositive ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
