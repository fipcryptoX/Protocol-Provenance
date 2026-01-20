import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface AssetCardProps {
  name: string
  avatarUrl?: string
  ethosScore: number
  stockMetric: {
    label: string
    valueUsd: number
  }
  flowMetric: {
    label: string
    valueUsd: number
  }
  className?: string
}

export function AssetCard({
  name,
  avatarUrl,
  ethosScore,
  stockMetric,
  flowMetric,
  className,
}: AssetCardProps) {
  const formatUSD = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {avatarUrl && (
              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt={`${name} logo`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
            </div>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            Ethos: {ethosScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-baseline border-b pb-2">
            <span className="text-sm text-muted-foreground font-medium">
              {stockMetric.label}
            </span>
            <span className="text-lg font-semibold">
              {formatUSD(stockMetric.valueUsd)}
            </span>
          </div>
          <div className="flex justify-between items-baseline border-b pb-2">
            <span className="text-sm text-muted-foreground font-medium">
              {flowMetric.label}
            </span>
            <span className="text-lg font-semibold">
              {formatUSD(flowMetric.valueUsd)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
