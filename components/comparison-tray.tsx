"use client"

import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/lib/store"
import { X } from "lucide-react"
import { useState } from "react"
import { ComparisonModal } from "./comparison-modal"

interface ComparisonTrayProps {
  protocols: Array<{
    name: string
    avatarUrl?: string
    ethosScore: number
    category: string
    stockMetric: { label: string; valueUsd: number }
    flowMetric: { label: string; valueUsd: number }
  }>
}

export function ComparisonTray({ protocols }: ComparisonTrayProps) {
  const { selectedProtocols, clearSelection } = useDashboardStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (selectedProtocols.length === 0) {
    return null
  }

  const selectedProtocolData = selectedProtocols
    .map((name) => protocols.find((p) => p.name === name))
    .filter(Boolean) as typeof protocols

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 overflow-x-auto">
              <span className="text-sm font-medium whitespace-nowrap">
                Selected ({selectedProtocols.length}):
              </span>
              <div className="flex items-center gap-2">
                {selectedProtocolData.map((protocol) => (
                  <div
                    key={protocol.name}
                    className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm"
                  >
                    {protocol.avatarUrl && (
                      <img
                        src={protocol.avatarUrl}
                        alt={protocol.name}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    <span className="font-medium">{protocol.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={selectedProtocols.length < 2}
                size="sm"
              >
                Compare ({selectedProtocols.length})
              </Button>
              <Button onClick={clearSelection} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        protocols={selectedProtocolData}
      />
    </>
  )
}
