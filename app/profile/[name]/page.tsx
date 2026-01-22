"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TimeSeriesChart } from "@/components/profile/time-series-chart"
import { TimeRangeSelector } from "@/components/profile/time-range-selector"
import { ReviewModal } from "@/components/profile/review-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader } from "@/components/ui/loader"
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
  fetchChainByName,
} from "@/lib/api/defillama-chains"
import {
  getAllReviewsByTwitter,
  EthosReview,
} from "@/lib/api/ethos"
import { cachedFetch } from "@/lib/cache"
import { CATEGORY_METRICS } from "@/types"
import { PROTOCOLS } from "@/lib/protocol-config"
import { getCorrectTwitterHandle } from "@/lib/twitter-overrides"
import { getCorrectChainLogo } from "@/lib/chain-logo-overrides"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const protocolName = params.name as string

  const [selectedRange, setSelectedRange] = useState<TimeRange>("1Y")
  const [stockData, setStockData] = useState<HistoricalDataPoint[]>([])
  const [flowData, setFlowData] = useState<HistoricalDataPoint[]>([])
  const [reviews, setReviews] = useState<EthosReview[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<WeeklyReviewData | null>(null)
  const [selectedWeekReviews, setSelectedWeekReviews] = useState<EthosReview[]>([])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

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

        // DeFiLlama slug overrides for protocols with different names
        const defillamaSlugOverrides: Record<string, string> = {
          'eigencloud': 'eigenlayer',
          'binance-staked-eth': 'binance-staked-eth',
          'lido': 'lido',
        }

        // Determine the DeFiLlama slug to use
        // 1. Check overrides first
        // 2. For configured protocols, use the config slug
        // 3. For dynamic protocols, use the URL parameter as the slug
        const defillamaSlug = defillamaSlugOverrides[protocolName.toLowerCase()] ||
                              protocolConfig?.defillama.protocolSlug ||
                              protocolName

        console.log(`Fetching data for ${protocolName}, using DeFiLlama slug: ${defillamaSlug}`)

        // Detect if this is a chain (common chain names)
        const commonChains = ['base', 'ethereum', 'solana', 'tron', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'bsc', 'fantom', 'blast', 'ronin', 'berachain', 'sonic', 'monad', 'hyperliquid', 'katana', 'kava', 'okexchain', 'metis', 'linea', 'sui', 'injective', 'stellar', 'tezos', 'near', 'cardano', 'stacks', 'ton', 'icp', 'movement', 'scroll', 'cronos', 'sei', 'aptos', 'canto', 'manta', 'manta atlantic', 'mode', 'zora', 'moonriver', 'arbitrum nova', 'gnosis', 'xdai', 'celo', 'aurora', 'harmony', 'moonbeam', 'zksync era', 'zksync', 'taiko', 'mantle', 'x layer', 'polygon zkevm', 'fraxtal', 'boba', 'zetachain', 'core']
        const isChain = commonChains.includes(protocolName.toLowerCase())

        // Chain name mapping for DefiLlama API (needs proper capitalization)
        const chainNameMapping: Record<string, string> = {
          'ethereum': 'Ethereum',
          'base': 'Base',
          'solana': 'Solana',
          'tron': 'Tron',
          'arbitrum': 'Arbitrum',
          'optimism': 'Optimism',
          'polygon': 'Polygon',
          'avalanche': 'Avalanche',
          'bsc': 'BSC',
          'fantom': 'Fantom',
          'blast': 'Blast',
          'ronin': 'Ronin',
          'berachain': 'Berachain',
          'sonic': 'Sonic',
          'monad': 'Monad',
          'hyperliquid': 'Hyperliquid',
          'katana': 'Katana',
          'kava': 'Kava',
          'okexchain': 'OKExChain',
          'metis': 'Metis',
          'linea': 'Linea',
          'sui': 'Sui',
          'injective': 'Injective',
          'stellar': 'Stellar',
          'tezos': 'Tezos',
          'near': 'Near',
          'cardano': 'Cardano',
          'stacks': 'Stacks',
          'ton': 'TON',
          'icp': 'ICP',
          'movement': 'Movement',
          'scroll': 'Scroll',
          'cronos': 'Cronos',
          'sei': 'Sei',
          'aptos': 'Aptos',
          'canto': 'Canto',
          'manta': 'Manta',
          'manta atlantic': 'Manta Atlantic',
          'mode': 'Mode',
          'zora': 'Zora',
          'moonriver': 'Moonriver',
          'arbitrum nova': 'Arbitrum Nova',
          'gnosis': 'xDai',
          'xdai': 'xDai',
          'celo': 'Celo',
          'aurora': 'Aurora',
          'harmony': 'Harmony',
          'moonbeam': 'Moonbeam',
          'zksync era': 'zkSync Era',
          'zksync': 'zkSync Era',
          'taiko': 'Taiko',
          'mantle': 'Mantle',
          'x layer': 'X Layer',
          'polygon zkevm': 'Polygon zkEVM',
          'fraxtal': 'Fraxtal',
          'boba': 'Boba',
          'zetachain': 'ZetaChain',
          'core': 'CORE',
        }

        // Get the properly formatted chain name for API calls
        const chainNameForApi = isChain
          ? (chainNameMapping[protocolName.toLowerCase()] || protocolName)
          : protocolName

        // Fetch all data in parallel for maximum speed
        const [protocolDetails, chainDetails, metricsData] = await Promise.all([
          // Fetch protocol details (for protocols only)
          isChain
            ? Promise.resolve(null)
            : cachedFetch(
                `protocol-details-${defillamaSlug}`,
                () => getProtocolDetails(defillamaSlug),
                900000 // 15 min cache
              ),
          // Fetch chain details (for chains only)
          isChain
            ? cachedFetch(
                `chain-details-${chainNameForApi}`,
                () => fetchChainByName(chainNameForApi),
                900000 // 15 min cache
              )
            : Promise.resolve(null),
          // Fetch metrics based on chain vs protocol
          isChain
            ? Promise.all([
                cachedFetch(
                  `stablecoin-mcap-${chainNameForApi}`,
                  () => getHistoricalStablecoinMcapForChain(chainNameForApi),
                  900000
                ),
                cachedFetch(
                  `revenue-${chainNameForApi}`,
                  () => getHistoricalRevenueForChain(chainNameForApi),
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
        console.log(`Chain details:`, chainDetails)

        // Set metrics data
        const [stockMetrics, flowMetrics] = metricsData
        console.log(`Stock data points: ${stockMetrics.length}, Flow data points: ${flowMetrics.length}`)
        if (stockMetrics.length > 0) {
          console.log(`Sample stock data:`, stockMetrics.slice(0, 3))
        }
        if (flowMetrics.length > 0) {
          console.log(`Sample flow data:`, flowMetrics.slice(0, 3))
        }
        setStockData(stockMetrics)
        setFlowData(flowMetrics)

        // Extract logo from protocol/chain details
        // For chains, use the override system to ensure consistency with dashboard
        let finalLogoUrl: string | null = null
        if (isChain) {
          // For chains, use chain data with fallback to DefiLlama CDN
          const chainLogo = chainDetails?.logo || null

          if (!chainLogo) {
            // Generate DefiLlama CDN URL from chain name as fallback
            const normalizedName = chainNameForApi.toLowerCase().replace(/\s+/g, '')
            const fallbackLogo = `https://icons.llama.fi/${normalizedName}.jpg`
            console.log(`No chain logo from API, using DefiLlama CDN: ${fallbackLogo}`)
            finalLogoUrl = getCorrectChainLogo(chainNameForApi, fallbackLogo)
          } else {
            console.log(`Chain logo from API: ${chainLogo}`)
            finalLogoUrl = getCorrectChainLogo(chainNameForApi, chainLogo)
          }

          console.log(`Final chain logo for ${chainNameForApi}: ${finalLogoUrl}`)
        } else {
          // For protocols, use DeFiLlama's logo
          finalLogoUrl = protocolDetails?.logo || null
          console.log(`Using protocol logo from DeFiLlama: ${finalLogoUrl}`)
        }

        if (finalLogoUrl) {
          setLogoUrl(finalLogoUrl)
        }

        // Chart data is ready - show the page!
        setLoading(false)

        // Determine which Twitter username to use:
        // 1. First priority: Centralized Twitter overrides
        // 2. Second: Twitter from DeFiLlama API (chains or protocols)
        // 3. Fallback: Twitter from protocol config (for manually configured protocols)
        const twitterFromApi = isChain
          ? chainDetails?.twitter
          : protocolDetails?.twitter

        const twitterUsername = getCorrectTwitterHandle(
          protocolName.toLowerCase(),
          twitterFromApi || protocolConfig?.ethos.twitterUsername || null
        )

        // Fetch Ethos reviews asynchronously in background
        // This doesn't block chart rendering
        if (twitterUsername) {
          console.log(`🔄 Starting background fetch of reviews for @${twitterUsername}...`)
          console.log(`   Protocol name: ${protocolName}`)
          console.log(`   Twitter from override system: ${twitterUsername}`)
          setReviewsLoading(true)

          // Use IIFE to ensure promise executes
          ;(async () => {
            try {
              console.log(`   Calling getAllReviewsByTwitter for @${twitterUsername}...`)
              const reviewsData = await cachedFetch(
                `all-reviews-twitter-${twitterUsername}`,
                () => getAllReviewsByTwitter(twitterUsername, 1000),
                300000 // 5 min cache
              )
              console.log(`✅ Reviews loaded: ${reviewsData.length} reviews for ${protocolName}`)
              if (reviewsData.length > 0) {
                console.log(`   First review:`, reviewsData[0])
                console.log(`   Review date range: ${reviewsData[0].createdAt} to ${reviewsData[reviewsData.length - 1].createdAt}`)
              }
              setReviews(reviewsData)
              setReviewsLoading(false)
            } catch (err) {
              console.error(`❌ Failed to load reviews for @${twitterUsername}:`, err)
              console.error(`   Error details:`, err instanceof Error ? err.message : err)
              setReviewsLoading(false)
            }
          })()
        } else {
          console.warn(`⚠️ No Twitter username found for ${protocolName}`)
          console.warn(`   Protocol details twitter: ${protocolDetails?.twitter}`)
          console.warn(`   Config twitter: ${protocolConfig?.ethos.twitterUsername}`)
        }
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile data. Please try again.")
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
    const result = Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    // Debug: Log how many points have flow data
    const pointsWithFlow = result.filter(p => p.flow !== null).length
    console.log(`Chart data: ${result.length} total points, ${pointsWithFlow} with flow data`)
    if (pointsWithFlow > 0) {
      console.log(`Sample points with flow:`, result.filter(p => p.flow !== null).slice(0, 3))
    }

    return result
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
      // NOTE: Not storing full review objects here for performance
      // Reviews are lazy-loaded when a marker is clicked

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
  const commonChains = ['base', 'ethereum', 'solana', 'tron', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'bsc', 'fantom', 'blast', 'ronin', 'berachain', 'sonic', 'monad', 'hyperliquid', 'katana', 'kava', 'okexchain', 'metis', 'linea', 'sui', 'injective', 'stellar', 'tezos', 'near', 'cardano', 'stacks', 'ton', 'icp', 'movement', 'scroll', 'cronos', 'sei', 'aptos', 'canto', 'manta', 'manta atlantic', 'mode', 'zora', 'moonriver', 'arbitrum nova', 'gnosis', 'xdai', 'celo', 'aurora', 'harmony', 'moonbeam', 'zksync era', 'zksync', 'taiko', 'mantle', 'x layer', 'polygon zkevm', 'fraxtal', 'boba', 'zetachain', 'core']
  const isChain = commonChains.includes(protocolName.toLowerCase())

  const stockLabel = isChain ? "Stablecoin MCap" : "TVL"
  const flowLabel = isChain ? "App Revenue (7d)" : "Revenue (7d)"

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 dark:text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading profile data...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        {/* Protocol Title */}
        <div className="flex items-start gap-4">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt={`${protocolName} logo`}
              width={64}
              height={64}
              className="rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 capitalize">
              {protocolName.replace(/-/g, " ")}
            </h1>
            <div className="mt-2 text-slate-600 dark:text-slate-400">
              {reviewsLoading ? (
                <Loader variant="loading-dots" text="Loading reviews" size="md" className="!text-slate-600 dark:!text-slate-400" />
              ) : reviews.length > 0 ? (
                <p className="text-sm font-medium">
                  Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""} across{" "}
                  {weeklyReviewData.length} week{weeklyReviewData.length !== 1 ? "s" : ""}
                </p>
              ) : (
                <p className="text-sm font-medium">Historical metrics and community reviews</p>
              )}
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Performance & Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredChartData.length > 0 ? (
              <TimeSeriesChart
                data={filteredChartData}
                stockLabel={stockLabel}
                flowLabel={flowLabel}
                reviewData={weeklyReviewData}
                onMarkerClick={(weekData) => {
                  // Lazy load: filter reviews for this specific week
                  const weekReviews = reviews.filter((review) => {
                    const reviewTimestamp = new Date(review.createdAt).getTime() / 1000
                    return reviewTimestamp >= weekData.weekStart && reviewTimestamp < weekData.weekEnd
                  })
                  console.log(`[ProfilePage] Lazy loading ${weekReviews.length} reviews for week ${weekData.weekStart}`)
                  setSelectedWeekReviews(weekReviews)
                  setSelectedWeek(weekData)
                }}
                onMarkerHover={() => {}}
              />
            ) : (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                No historical data available for this protocol.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Modal */}
        <ReviewModal
          isOpen={selectedWeek !== null}
          onClose={() => {
            setSelectedWeek(null)
            setSelectedWeekReviews([])
          }}
          weekData={selectedWeek}
          weekReviews={selectedWeekReviews}
          chartData={filteredChartData}
          stockLabel={stockLabel}
          flowLabel={flowLabel}
        />
      </div>
    </div>
  )
}
