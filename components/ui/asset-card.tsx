"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CategoryBadge, ProtocolTag } from "@/components/ui/protocol-tag"
import { cn } from "@/lib/utils"
import { useDashboardStore } from "@/lib/store"
import { Check } from "lucide-react"
import { Sparkline } from "./sparkline"

export interface AssetCardProps {
  name: string
  avatarUrl?: string
  ethosScore: number
  category: string
  tags?: string[]
  stockMetric: {
    label: string
    valueUsd: number
  }
  flowMetric: {
    label: string
    valueUsd: number
  }
  className?: string
  sparklineData?: Array<{ date: number; value: number }>
  onVisible?: () => void
}

export function AssetCard({
  name,
  avatarUrl,
  ethosScore,
  category,
  tags,
  stockMetric,
  flowMetric,
  className,
  sparklineData,
  onVisible,
}: AssetCardProps) {
  const { selectedProtocols, toggleProtocol } = useDashboardStore()
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false)

  const isSelected = selectedProtocols.includes(name)

  // Intersection observer for lazy loading sparklines
  React.useEffect(() => {
    if (!onVisible || hasBeenVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible) {
            setHasBeenVisible(true)
            onVisible()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [onVisible, hasBeenVisible])

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

  const handleCardClick = () => {
    toggleProtocol(name)
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "w-full max-w-md cursor-pointer transition-all",
        isSelected && "ring-2 ring-primary shadow-lg",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Selection indicator */}
            <div
              className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                isSelected
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
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
              <CategoryBadge category={category} className="mt-1" />
            </div>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            Ethos: {ethosScore}
          </Badge>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <ProtocolTag key={tag} type={tag} />
            ))}
          </div>
        )}
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

          {/* 30-day sparkline */}
          <div className="pt-2">
            <Sparkline data={sparklineData} isLoading={!hasBeenVisible} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
