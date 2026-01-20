"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Skeleton } from "./skeleton"

interface SparklineProps {
  data?: Array<{ date: number; value: number }>
  isLoading?: boolean
}

export function Sparkline({ data, isLoading }: SparklineProps) {
  if (isLoading || !data || data.length === 0) {
    return <Skeleton className="h-12 w-full" />
  }

  // Transform data for Recharts
  const chartData = data.map((point) => ({
    value: point.value,
  }))

  // Determine line color based on trend (first vs last value)
  const isPositive = data[data.length - 1].value >= data[0].value
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
