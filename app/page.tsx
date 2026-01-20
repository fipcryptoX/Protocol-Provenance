"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { AssetCard } from "@/components/ui/asset-card"
import { DashboardToolbar } from "@/components/dashboard-toolbar"
import { DashboardFilters } from "@/components/dashboard-filters"
import { DashboardStats } from "@/components/dashboard-stats"
import { EmptyState } from "@/components/ui/empty-state"
import { ProtocolCardSkeleton } from "@/components/ui/protocol-card-skeleton"
import { ComparisonTray } from "@/components/comparison-tray"
import { useDashboardStore } from "@/lib/store"

interface ProtocolData {
  name: string
  avatarUrl?: string
  ethosScore: number
  category: string
  tags?: string[]
  stockMetric: { label: string; valueUsd: number }
  flowMetric: { label: string; valueUsd: number }
  slug?: string
  chains?: string[]
}

export default function Home() {
  const [allProtocols, setAllProtocols] = useState<ProtocolData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(30) // Initial: 30
  const [sparklineData, setSparklineData] = useState<
    Record<string, Array<{ date: number; value: number }>>
  >({})

  const { filters, searchQuery, sortBy } = useDashboardStore()

  // Fetch initial protocol data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch protocols and chains in parallel
        const [protocolsRes, chainsRes] = await Promise.all([
          fetch("/api/protocols"),
          fetch("/api/chains"),
        ])

        if (!protocolsRes.ok || !chainsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [protocolsData, chainsData] = await Promise.all([
          protocolsRes.json(),
          chainsRes.json(),
        ])

        // Combine and set data
        const combined = [
          ...(protocolsData.data || []),
          ...(chainsData.data || []),
        ]

        setAllProtocols(combined)

        // Log any missing Ethos scores
        const missingScores = combined.filter((p: ProtocolData) => p.ethosScore === 0)
        if (missingScores.length > 0) {
          console.warn(
            `⚠️ ${missingScores.length} protocols missing Ethos scores:`,
            missingScores.map((p: ProtocolData) => p.name).join(", ")
          )
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort protocols
  const filteredAndSorted = useMemo(() => {
    let filtered = [...allProtocols]

    // Apply filters
    if (filters.ethosMin > 0) {
      filtered = filtered.filter((p) => p.ethosScore >= filters.ethosMin)
    }
    if (filters.ethosMax < Infinity) {
      filtered = filtered.filter((p) => p.ethosScore <= filters.ethosMax)
    }
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category)
    }
    if (filters.stockMin > 0) {
      filtered = filtered.filter((p) => p.stockMetric.valueUsd >= filters.stockMin)
    }
    if (filters.stockMax < Infinity) {
      filtered = filtered.filter((p) => p.stockMetric.valueUsd <= filters.stockMax)
    }
    if (filters.flowMin > 0) {
      filtered = filtered.filter((p) => p.flowMetric.valueUsd >= filters.flowMin)
    }
    if (filters.flowMax < Infinity) {
      filtered = filtered.filter((p) => p.flowMetric.valueUsd <= filters.flowMax)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.chains && p.chains.some((chain) => chain.toLowerCase().includes(query)))
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "ethos-desc":
        filtered.sort((a, b) => b.ethosScore - a.ethosScore)
        break
      case "ethos-asc":
        filtered.sort((a, b) => a.ethosScore - b.ethosScore)
        break
      case "category":
        filtered.sort((a, b) => a.category.localeCompare(b.category))
        break
      case "stock-desc":
        filtered.sort((a, b) => b.stockMetric.valueUsd - a.stockMetric.valueUsd)
        break
      case "flow-desc":
        filtered.sort((a, b) => b.flowMetric.valueUsd - a.flowMetric.valueUsd)
        break
      default:
        break
    }

    return filtered
  }, [allProtocols, filters, searchQuery, sortBy])

  // Protocols to display (with infinite scroll limit)
  const displayedProtocols = filteredAndSorted.slice(0, visibleCount)

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        visibleCount < filteredAndSorted.length
      ) {
        setVisibleCount((prev) => Math.min(prev + 15, filteredAndSorted.length))
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleCount, filteredAndSorted.length])

  // Reset visible count when filters/search changes
  useEffect(() => {
    setVisibleCount(30)
  }, [filters, searchQuery, sortBy])

  // Lazy load sparkline data
  const loadSparklineData = useCallback(async (protocolName: string, slug?: string) => {
    if (!slug || sparklineData[protocolName]) return

    try {
      const res = await fetch(`/api/protocol/history?slug=${slug}&metric=tvl`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data.length > 0) {
          setSparklineData((prev) => ({
            ...prev,
            [protocolName]: data.data,
          }))
        }
      }
    } catch (err) {
      console.warn(`Failed to load sparkline for ${protocolName}:`, err)
    }
  }, [sparklineData])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Protocol Provenance
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            DeFi sensemaking through belief and behavior
          </p>
        </div>

        {/* Toolbar (Search + Sort + Theme Toggle) */}
        <DashboardToolbar />

        {/* Filters */}
        <DashboardFilters />

        {/* Stats */}
        <DashboardStats
          totalCount={allProtocols.length}
          filteredCount={filteredAndSorted.length}
          isLoading={isLoading}
        />

        {/* Main Content */}
        <div className="px-4 py-8">
          {isLoading ? (
            // Loading skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProtocolCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-16">
              <p className="text-destructive">Error: {error}</p>
            </div>
          ) : displayedProtocols.length === 0 ? (
            // Empty state
            <EmptyState />
          ) : (
            // Protocol cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProtocols.map((protocol) => (
                <AssetCard
                  key={protocol.name}
                  name={protocol.name}
                  avatarUrl={protocol.avatarUrl}
                  ethosScore={protocol.ethosScore}
                  category={protocol.category}
                  tags={protocol.tags}
                  stockMetric={protocol.stockMetric}
                  flowMetric={protocol.flowMetric}
                  sparklineData={sparklineData[protocol.name]}
                  onVisible={() => loadSparklineData(protocol.name, protocol.slug)}
                />
              ))}
            </div>
          )}

          {/* Loading more indicator */}
          {!isLoading &&
            visibleCount < filteredAndSorted.length && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Scroll for more protocols...
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8 px-4">
          <p>
            Data from{" "}
            <a
              href="https://ethos.network"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Ethos
            </a>{" "}
            and{" "}
            <a
              href="https://defillama.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              DefiLlama
            </a>
          </p>
        </div>
      </div>

      {/* Comparison Tray (fixed at bottom) */}
      <ComparisonTray protocols={allProtocols} />

      {/* Bottom padding to account for comparison tray */}
      <div className="h-24" />
    </div>
  )
}
