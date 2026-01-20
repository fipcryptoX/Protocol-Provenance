/**
 * Dynamic Protocol Data System
 *
 * Automatically generates protocol cards from DefiLlama data:
 * 1. Fetches all protocols and filters by TVL >= $10B
 * 2. Normalizes categories
 * 3. Fetches aggregated datasets (OI, volume, revenue, etc.)
 * 4. Matches protocols to their stock/flow metrics
 * 5. Fetches Ethos scores from Twitter
 * 6. Returns normalized ProtocolCardData for rendering
 */

import { fetchAllProtocols, filterByTVL, DefiLlamaProtocol } from "./api/defillama-registry"
import {
  fetchAllData,
  findProtocolByName,
  AggregatedData
} from "./api/defillama-aggregator"
import {
  normalizeCategory,
  getCategoryMetrics,
  NormalizedCategory
} from "./category-normalizer"
import { getUserScoreFromTwitter } from "./api/ethos"
import { ProtocolCardData } from "./protocol-data"
import { getCorrectTwitterHandle } from "./twitter-overrides"

/**
 * Enriched protocol with normalized category and metrics
 */
export interface EnrichedProtocol {
  id: string
  name: string
  slug: string
  category: NormalizedCategory
  tvl: number
  logo: string | null
  twitter: string | null
}

/**
 * Fetch and filter protocols by TVL
 */
export async function fetchFilteredProtocols(
  minTVL: number = 10_000_000_000
): Promise<EnrichedProtocol[]> {
  console.log(`Fetching protocols with TVL >= $${minTVL / 1_000_000_000}B...`)

  // Fetch all protocols
  const allProtocols = await fetchAllProtocols()

  // Filter by TVL
  const filtered = filterByTVL(allProtocols, minTVL)
  console.log(`Found ${filtered.length} protocols with TVL >= $${minTVL / 1_000_000_000}B`)

  // Normalize and enrich
  const enriched: EnrichedProtocol[] = []

  for (const protocol of filtered) {
    // Normalize category
    const normalizedCategory = normalizeCategory(protocol.category)

    if (!normalizedCategory) {
      console.log(`Skipping ${protocol.name} - unsupported category: ${protocol.category}`)
      continue
    }

    enriched.push({
      id: protocol.id,
      name: protocol.name,
      slug: protocol.slug,
      category: normalizedCategory,
      tvl: protocol.tvl,
      logo: protocol.logo,
      twitter: protocol.twitter
    })
  }

  console.log(`Enriched ${enriched.length} protocols with normalized categories`)
  return enriched
}

/**
 * Get stock metric value for a protocol
 */
function getStockMetricValue(
  protocol: EnrichedProtocol,
  aggregatedData: AggregatedData
): number | null {
  const metrics = getCategoryMetrics(protocol.category)
  const { source, field } = metrics.stock

  switch (source) {
    case "protocols":
      // TVL already available on the protocol
      return protocol.tvl

    case "open-interest": {
      const oiProtocol = findProtocolByName(aggregatedData.openInterest, protocol.name)
      if (!oiProtocol) {
        console.warn(`No open interest data found for ${protocol.name}`)
        return null
      }
      return oiProtocol[field as keyof typeof oiProtocol] as number || null
    }

    case "stablecoins": {
      // Find stablecoin by protocol name
      const stablecoin = aggregatedData.stablecoins.find(s =>
        s.name.toLowerCase().includes(protocol.name.toLowerCase()) ||
        protocol.name.toLowerCase().includes(s.name.toLowerCase())
      )

      if (!stablecoin) {
        console.warn(`No stablecoin data found for ${protocol.name}`)
        return null
      }

      // Calculate total circulating USD across all chains
      const totalCirculating = Object.values(stablecoin.circulating || {}).reduce(
        (sum, val) => sum + (val || 0),
        0
      )

      return totalCirculating
    }

    default:
      console.warn(`Unknown stock source: ${source}`)
      return null
  }
}

/**
 * Get flow metric value for a protocol
 */
function getFlowMetricValue(
  protocol: EnrichedProtocol,
  aggregatedData: AggregatedData
): number | null {
  const metrics = getCategoryMetrics(protocol.category)
  const { source, field } = metrics.flow

  switch (source) {
    case "derivatives": {
      const derivProtocol = findProtocolByName(aggregatedData.derivatives, protocol.name)
      if (!derivProtocol) {
        console.warn(`No derivatives data found for ${protocol.name}`)
        return null
      }
      return derivProtocol[field as keyof typeof derivProtocol] as number || null
    }

    case "dexes": {
      const dexProtocol = findProtocolByName(aggregatedData.dexes, protocol.name)
      if (!dexProtocol) {
        console.warn(`No DEX data found for ${protocol.name}`)
        return null
      }
      return dexProtocol[field as keyof typeof dexProtocol] as number || null
    }

    case "revenue": {
      const revProtocol = findProtocolByName(aggregatedData.revenue, protocol.name)
      if (!revProtocol) {
        console.warn(`No revenue data found for ${protocol.name}`)
        return null
      }
      return revProtocol[field as keyof typeof revProtocol] as number || null
    }

    default:
      console.warn(`Unknown flow source: ${source}`)
      return null
  }
}

/**
 * Build protocol card data for a single protocol
 */
export async function buildProtocolCardData(
  protocol: EnrichedProtocol,
  aggregatedData: AggregatedData
): Promise<ProtocolCardData | null> {
  console.log(`Building card data for ${protocol.name}...`)

  // Get metrics config
  const metricsConfig = getCategoryMetrics(protocol.category)

  // Get stock metric value
  let stockValue = getStockMetricValue(protocol, aggregatedData)
  if (stockValue === null || stockValue === 0) {
    console.warn(`No stock metric for ${protocol.name}, using TVL as fallback`)
    stockValue = protocol.tvl
  }

  // Get flow metric value
  const flowValue = getFlowMetricValue(protocol, aggregatedData)
  if (flowValue === null || flowValue === 0) {
    console.warn(`Failed to get flow metric for ${protocol.name}, skipping protocol`)
    return null
  }

  // Fetch Ethos score from Twitter (with override support)
  let ethosScore = 0
  const correctTwitterHandle = getCorrectTwitterHandle(protocol.name, protocol.twitter)

  if (correctTwitterHandle) {
    if (correctTwitterHandle !== protocol.twitter) {
      console.log(`Using overridden Twitter handle for ${protocol.name}: ${correctTwitterHandle} (was: ${protocol.twitter})`)
    }

    try {
      const twitterData = await getUserScoreFromTwitter(correctTwitterHandle)
      if (twitterData) {
        ethosScore = twitterData.score
        console.log(`Ethos score for ${protocol.name}: ${ethosScore}`)
      } else {
        console.warn(`Twitter user ${correctTwitterHandle} not found in Ethos for ${protocol.name}`)
      }
    } catch (error) {
      console.warn(`Failed to fetch Ethos score for ${protocol.name}:`, error)
    }
  } else {
    console.warn(`No Twitter handle for ${protocol.name}`)
  }

  // Return normalized card data
  return {
    name: protocol.name,
    avatarUrl: protocol.logo || undefined,
    ethosScore,
    category: protocol.category.toLowerCase(),
    tags: undefined, // No tags for now
    stockMetric: {
      label: metricsConfig.stock.label,
      valueUsd: stockValue
    },
    flowMetric: {
      label: metricsConfig.flow.label,
      valueUsd: flowValue
    },
    slug: protocol.slug,
    chains: undefined // Will be populated from protocol data if available
  }
}

/**
 * Build all protocol cards
 */
export async function buildAllProtocolCards(
  minTVL: number = 10_000_000_000
): Promise<ProtocolCardData[]> {
  console.log("Starting dynamic protocol card generation...")

  // Step 1: Fetch and filter protocols
  const protocols = await fetchFilteredProtocols(minTVL)

  // Step 2: Fetch all aggregated datasets in parallel
  const aggregatedData = await fetchAllData()

  // Step 3: Build card data for each protocol
  const cardDataPromises = protocols.map(protocol =>
    buildProtocolCardData(protocol, aggregatedData)
  )

  const cardDataResults = await Promise.all(cardDataPromises)

  // Filter out nulls
  const validCards = cardDataResults.filter((card): card is ProtocolCardData => card !== null)

  console.log(`Successfully built ${validCards.length}/${protocols.length} protocol cards`)

  return validCards
}
