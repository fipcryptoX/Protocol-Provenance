"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { TimeSeriesChart } from "@/components/profile/time-series-chart"
import { TimeRangeSelector } from "@/components/profile/time-range-selector"
import { ReviewModal } from "@/components/profile/review-modal"
import { ReviewTooltip } from "@/components/profile/review-tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import {
  TimeRange,
  ChartDataPoint,
  WeeklyReviewData,
  ProtocolCategory,
} from "@/types"
import {
  getHistoricalTVL,
  getHistoricalFees,
  getHistoricalStablecoinMcap,
  getProtocolDetails,
  HistoricalDataPoint,
} from "@/lib/api/defillama"
import {
  fetchChainRevenue,
  getHistoricalStablecoinMcapForChain,
  getHistoricalRevenueForChain,
} from "@/lib/api/defillama-chains"
import {
  getAllReviewsByTwitter,
  EthosReview,
} from "@/lib/api/ethos"
import { cachedFetch } from "@/lib/cache"
import { CATEGORY_METRICS } from "@/types"
import { PROTOCOLS } from "@/lib/protocol-config"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const protocolName = params.name as string

  const [selectedRange, setSelectedRange] = useState<TimeRange>("1Y")
  const [stockData, setStockData] = useState<HistoricalDataPoint[]>([])
  const [flowData, setFlowData] = useState<HistoricalDataPoint[]>([])
  const [reviews, setReviews] = useState<EthosReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<WeeklyReviewData | null>(null)
  const [hoveredWeek, setHoveredWeek] = useState<WeeklyReviewData | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Try to find the protocol config by name
        const protocolId = protocolName.toLowerCase().replace(/\s+/g, "-")
        const protocolConfig = Object.values(PROTOCOLS).find(
          (p) => p.id === protocolId || p.displayName.toLowerCase() === protocolName.toLowerCase()
        )

        // Determine the DeFiLlama slug to use
        // For configured protocols, use the config slug
        // For dynamic protocols, use the URL parameter as the slug
        const defillamaSlug = protocolConfig?.defillama.protocolSlug || protocolName

        console.log(`Fetching data for ${protocolName}, using DeFiLlama slug: ${defillamaSlug}`)

        // Detect if this is a chain (common chain names)
        const commonChains = ['base', 'ethereum', 'solana', 'tron', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'bsc', 'fantom']
        const isChain = commonChains.includes(protocolName.toLowerCase())

        // Twitter username resolution with hardcoded overrides for specific entities
        const twitterOverrides: Record<string, string> = {
          'base': 'base',
          'eigencloud': 'eigencloud',
        }

        // Fetch all data in parallel for maximum speed
        const [protocolDetails, metricsData] = await Promise.all([
          // Fetch protocol details
          cachedFetch(
            `protocol-details-${defillamaSlug}`,
            () => getProtocolDetails(defillamaSlug),
            900000 // 15 min cache
          ),
          // Fetch metrics based on chain vs protocol
          isChain
            ? Promise.all([
                cachedFetch(
                  `stablecoin-mcap-${protocolName}`,
                  () => getHistoricalStablecoinMcapForChain(protocolName),
                  900000
                ),
                cachedFetch(
                  `revenue-${protocolName}`,
                  () => getHistoricalRevenueForChain(protocolName),
                  900000
                )
              ])
            : Promise.all([
                cachedFetch(
                  `tvl-${protocolName}`,
                  () => getHistoricalTVL(defillamaSlug),
                  900000
                ),
                cachedFetch(
                  `fees-${protocolName}`,
                  () => getHistoricalFees(defillamaSlug),
                  900000
                ),
              ])
        ])

        console.log(`Protocol details:`, protocolDetails)

        // Set metrics data
        const [stockMetrics, flowMetrics] = metricsData
        setStockData(stockMetrics)
        setFlowData(flowMetrics)

        // Determine which Twitter username to use:
        // 1. First priority: Hardcoded overrides
        // 2. Second: Twitter from DeFiLlama API
        // 3. Fallback: Twitter from protocol config (for manually configured protocols)
        const twitterUsername = twitterOverrides[protocolName.toLowerCase()] ||
                                protocolDetails?.twitter ||
                                protocolConfig?.ethos.twitterUsername

        // Fetch Ethos reviews using Twitter username (parallel with metrics)
        if (twitterUsername) {
          console.log(`Fetching ALL reviews for @${twitterUsername}`)
          const reviewsData = await cachedFetch(
            `all-reviews-twitter-${twitterUsername}`,
            () => getAllReviewsByTwitter(twitterUsername, 1000),
            300000 // 5 min cache
          )
          setReviews(reviewsData)
          console.log(`Fetched ${reviewsData.length} reviews`)
        } else {
          console.warn(`No Twitter username found for ${protocolName}, skipping reviews`)
        }
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [protocolName])

  // Filter data based on selected time range
  const filteredChartData = useMemo((): ChartDataPoint[] => {
    const now = Date.now() / 1000
    let cutoffTimestamp = 0

    switch (selectedRange) {
      case "1M":
        cutoffTimestamp = now - 30 * 24 * 60 * 60
        break
      case "3M":
        cutoffTimestamp = now - 90 * 24 * 60 * 60
        break
      case "6M":
        cutoffTimestamp = now - 180 * 24 * 60 * 60
        break
      case "1Y":
        cutoffTimestamp = now - 365 * 24 * 60 * 60
        break
      case "All":
        // Start from 2024
        cutoffTimestamp = new Date("2024-01-01").getTime() / 1000
        break
    }

    // Merge stock and flow data by timestamp
    const dataMap = new Map<number, ChartDataPoint>()

    stockData.forEach((point) => {
      if (point.timestamp >= cutoffTimestamp) {
        dataMap.set(point.timestamp, {
          timestamp: point.timestamp,
          date: new Date(point.timestamp * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          }),
          stock: point.value,
          flow: null,
        })
      }
    })

    flowData.forEach((point) => {
      if (point.timestamp >= cutoffTimestamp) {
        const existing = dataMap.get(point.timestamp)
        if (existing) {
          existing.flow = point.value
        } else {
          dataMap.set(point.timestamp, {
            timestamp: point.timestamp,
            date: new Date(point.timestamp * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            }),
            stock: null,
            flow: point.value,
          })
        }
      }
    })

    // Sort by timestamp
    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp)
  }, [stockData, flowData, selectedRange])

  // Aggregate reviews by week
  const weeklyReviewData = useMemo((): WeeklyReviewData[] => {
    const WEEK_IN_SECONDS = 7 * 24 * 60 * 60
    const weekMap = new Map<number, WeeklyReviewData>()

    reviews.forEach((review) => {
      const reviewTimestamp = new Date(review.createdAt).getTime() / 1000
      const weekStart = Math.floor(reviewTimestamp / WEEK_IN_SECONDS) * WEEK_IN_SECONDS

      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, {
          weekStart,
          weekEnd: weekStart + WEEK_IN_SECONDS,
          reviewCount: 0,
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          dominantSentiment: "NEUTRAL",
          reviews: [],
        })
      }

      const weekData = weekMap.get(weekStart)!
      weekData.reviewCount++
      weekData.reviews.push(review)

      // Update sentiment counts
      if (review.reviewScore === "POSITIVE") {
        weekData.sentiment.positive++
      } else if (review.reviewScore === "NEGATIVE") {
        weekData.sentiment.negative++
      } else {
        weekData.sentiment.neutral++
      }
    })

    // Calculate dominant sentiment for each week
    weekMap.forEach((weekData) => {
      const { positive, neutral, negative } = weekData.sentiment
      if (positive >= neutral && positive >= negative) {
        weekData.dominantSentiment = "POSITIVE"
      } else if (negative > neutral && negative > positive) {
        weekData.dominantSentiment = "NEGATIVE"
      } else {
        weekData.dominantSentiment = "NEUTRAL"
      }
    })

    const result = Array.from(weekMap.values()).sort((a, b) => a.weekStart - b.weekStart)
    console.log(`Aggregated ${reviews.length} reviews into ${result.length} weeks`)
    if (result.length > 0) {
      console.log(`First week:`, {
        weekStart: new Date(result[0].weekStart * 1000).toISOString(),
        reviewCount: result[0].reviewCount,
        dominantSentiment: result[0].dominantSentiment
      })
      console.log(`Last week:`, {
        weekStart: new Date(result[result.length - 1].weekStart * 1000).toISOString(),
        reviewCount: result[result.length - 1].reviewCount,
        dominantSentiment: result[result.length - 1].dominantSentiment
      })

      // Log the date range of actual reviews
      const reviewDates = reviews.map(r => new Date(r.createdAt).getTime()).sort((a, b) => a - b)
      console.log(`Review date range:`, {
        earliest: new Date(reviewDates[0]).toISOString(),
        latest: new Date(reviewDates[reviewDates.length - 1]).toISOString(),
        totalReviews: reviews.length
      })
    }
    return result
  }, [reviews])

  // Get metric labels based on whether it's a chain or protocol
  const commonChains = ['base', 'ethereum', 'solana', 'tron', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'bsc', 'fantom']
  const isChain = commonChains.includes(protocolName.toLowerCase())

  const stockLabel = isChain ? "Stablecoin MCap" : "TVL"
  const flowLabel = isChain ? "App Revenue (24h)" : "Revenue (30d)"

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile data...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <TimeRangeSelector
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
        </div>

        {/* Protocol Title */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 capitalize">
            {protocolName.replace(/-/g, " ")}
          </h1>
          <p className="text-slate-600 mt-2">
            Historical metrics and community reviews
          </p>
        </div>

        {/* Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Performance & Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredChartData.length > 0 ? (
              <div className="relative">
                <TimeSeriesChart
                  data={filteredChartData}
                  stockLabel={stockLabel}
                  flowLabel={flowLabel}
                  reviewData={weeklyReviewData}
                  onMarkerClick={(weekData) => setSelectedWeek(weekData)}
                  onMarkerHover={(weekData, event) => {
                    setHoveredWeek(weekData)
                    if (weekData && event) {
                      setTooltipPosition({
                        x: event.clientX || 0,
                        y: event.clientY || 0,
                      })
                    }
                  }}
                />
                {hoveredWeek && (
                  <ReviewTooltip weekData={hoveredWeek} position={tooltipPosition} />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600">
                No historical data available for this protocol.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Availability Info */}
        <div className="text-sm text-slate-600 space-y-1">
          {stockData.length === 0 && (
            <p>Stock metric data is not available for this protocol.</p>
          )}
          {flowData.length === 0 && (
            <p>Flow metric data is not available for this protocol.</p>
          )}
          {reviews.length === 0 && (
            <p>No Ethos reviews found for this protocol.</p>
          )}
          {reviews.length > 0 && (
            <p>
              Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""} across{" "}
              {weeklyReviewData.length} week{weeklyReviewData.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Review Modal */}
        <ReviewModal
          isOpen={selectedWeek !== null}
          onClose={() => setSelectedWeek(null)}
          weekData={selectedWeek}
          chartData={filteredChartData}
          stockLabel={stockLabel}
          flowLabel={flowLabel}
        />
      </div>
    </div>
  )
}
