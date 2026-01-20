"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Protocol {
  name: string
  avatarUrl?: string
  ethosScore: number
  category: string
  stockMetric: { label: string; valueUsd: number }
  flowMetric: { label: string; valueUsd: number }
}

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  protocols: Protocol[]
}

export function ComparisonModal({
  isOpen,
  onClose,
  protocols,
}: ComparisonModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Protocol Comparison</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {protocols.map((protocol) => (
            <div
              key={protocol.name}
              className="border rounded-lg p-4 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start gap-3 pb-3 border-b">
                {protocol.avatarUrl && (
                  <img
                    src={protocol.avatarUrl}
                    alt={protocol.name}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{protocol.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {protocol.category}
                  </Badge>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">
                    Ethos Score
                  </span>
                  <span className="text-lg font-semibold">
                    {protocol.ethosScore}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">
                    {protocol.stockMetric.label}
                  </span>
                  <span className="text-lg font-semibold">
                    {formatUSD(protocol.stockMetric.valueUsd)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">
                    {protocol.flowMetric.label}
                  </span>
                  <span className="text-lg font-semibold">
                    {formatUSD(protocol.flowMetric.valueUsd)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
