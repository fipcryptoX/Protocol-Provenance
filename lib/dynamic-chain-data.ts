/**
 * Dynamic Chain Data System
 *
 * Automatically generates chain cards from DefiLlama data:
 * 1. Fetches all chains and stablecoin market caps
 * 2. Filters by Stablecoin MCap >= $5M
 * 3. Fetches chain revenue data (app revenue 24h)
 * 4. Fetches Ethos scores from Twitter
 * 5. Returns normalized ProtocolCardData for rendering
 */

import {
  fetchAllChains,
  fetchChainRevenue,
  fetchStablecoinMCapByChain,
  filterChainsByStablecoinMCap,
  DefiLlamaChain
} from "./api/defillama-chains"
import { getUserScoreFromTwitter, getReviewsByTwitter, EthosReview } from "./api/ethos"
import { ProtocolCardData, ReviewDistribution } from "./protocol-data"
import { getCorrectTwitterHandle } from "./twitter-overrides"
import { getCorrectChainLogo } from "./chain-logo-overrides"
import { batchGetTwitterFromGeckoIds, batchGetLogosFromGeckoIds } from "./api/coingecko"

/**
 * Enriched chain with metrics
 */
export interface EnrichedChain {
  name: string
  stablecoinMCap: number
  logo: string | null
  twitter: string | null
  revenue24h: number
}

/**
 * Fetch and filter chains by Stablecoin MCap
 */
export async function fetchFilteredChains(
  minMCap: number = 5_000_000
): Promise<EnrichedChain[]> {
  console.log(`Fetching chains with Stablecoin MCap >= $${minMCap / 1_000_000}M...`)

  // Fetch all chains
  const allChains = await fetchAllChains()

  // Fetch stablecoin market cap for all chains
  const stableMCapByChain = await fetchStablecoinMCapByChain()

  // Filter by Stablecoin MCap
  const filtered = filterChainsByStablecoinMCap(allChains, stableMCapByChain, minMCap)
  console.log(`Found ${filtered.length} chains with Stablecoin MCap >= $${minMCap / 1_000_000}M`)

  // Fetch chain revenue data for filtered chains
  const revenueByChain = await fetchChainRevenue(filtered)

  // Collect gecko_ids for CoinGecko Twitter and logo lookup
  const geckoIds = filtered
    .filter(chain => chain.gecko_id)
    .map(chain => chain.gecko_id as string)

  console.log(`Found ${geckoIds.length} chains with gecko_id for CoinGecko lookup`)

  // Batch fetch Twitter handles and logos from CoinGecko
  const [twitterByGeckoId, logosByGeckoId] = await Promise.all([
    geckoIds.length > 0 ? batchGetTwitterFromGeckoIds(geckoIds) : Promise.resolve({}),
    geckoIds.length > 0 ? batchGetLogosFromGeckoIds(geckoIds) : Promise.resolve({})
  ])

  // Enrich chains with revenue, logo, and Twitter data
  const enriched: EnrichedChain[] = filtered.map(chain => {
    const revenue24h = revenueByChain[chain.name] || 0

    // Determine logo with priority:
    // 1. CoinGecko (via gecko_id) - high-res, reliable
    // 2. DeFiLlama's logo field - fallback
    // 3. Manual overrides - last resort
    let logoUrl: string | null = null

    if (chain.gecko_id && logosByGeckoId[chain.gecko_id]) {
      logoUrl = logosByGeckoId[chain.gecko_id]
      console.log(`Using CoinGecko logo for ${chain.name}: ${logoUrl}`)
    } else if (chain.logo) {
      logoUrl = chain.logo
      console.log(`Using DeFiLlama logo for ${chain.name}: ${logoUrl}`)
    } else {
      console.log(`No logo found for ${chain.name} (gecko_id: ${chain.gecko_id || 'none'})`)
    }

    // Apply manual overrides if any
    const correctLogo = getCorrectChainLogo(chain.name, logoUrl)

    // Determine Twitter handle with priority:
    // 1. CoinGecko (via gecko_id) - most reliable
    // 2. DeFiLlama's twitter field - fallback
    let twitterHandle: string | null = null

    if (chain.gecko_id && twitterByGeckoId[chain.gecko_id]) {
      twitterHandle = twitterByGeckoId[chain.gecko_id]
      console.log(`Using CoinGecko Twitter for ${chain.name}: @${twitterHandle}`)
    } else if (chain.twitter) {
      twitterHandle = chain.twitter
      console.log(`Using DeFiLlama Twitter for ${chain.name}: @${twitterHandle}`)
    } else {
      console.log(`No Twitter handle found for ${chain.name} (gecko_id: ${chain.gecko_id || 'none'})`)
    }

    return {
      name: chain.name,
      stablecoinMCap: chain.stablecoinMCap,
      logo: correctLogo,
      twitter: twitterHandle,
      revenue24h
    }
  })

  const chainsWithTwitter = enriched.filter(c => c.twitter).length
  console.log(`Enriched ${enriched.length} chains with revenue data (${chainsWithTwitter} have Twitter handles)`)
  return enriched
}

/**
 * Calculate review distribution from reviews
 */
function calculateReviewDistribution(reviews: EthosReview[]): ReviewDistribution {
  const distribution: ReviewDistribution = {
    negative: 0,
    neutral: 0,
    positive: 0,
  }

  reviews.forEach((review) => {
    switch (review.reviewScore) {
      case "NEGATIVE":
        distribution.negative++
        break
      case "NEUTRAL":
        distribution.neutral++
        break
      case "POSITIVE":
        distribution.positive++
        break
    }
  })

  return distribution
}

/**
 * Build chain card data for a single chain
 */
export async function buildChainCardData(
  chain: EnrichedChain
): Promise<ProtocolCardData | null> {
  console.log(`Building card data for ${chain.name} chain...`)
  console.log(`  Stablecoin MCap: $${chain.stablecoinMCap.toLocaleString()}`)
  console.log(`  Revenue 24h: $${chain.revenue24h.toLocaleString()}`)

  // Stock metric: Stablecoin MCap
  const stockValue = chain.stablecoinMCap

  // Flow metric: App Revenue (24h)
  const flowValue = chain.revenue24h

  // Skip only if BOTH metrics are zero (no data at all)
  if (stockValue === 0 && flowValue === 0) {
    console.warn(`${chain.name} has zero metrics for both stock and flow, skipping`)
    return null
  }

  // Log warning if only one metric is missing
  if (stockValue === 0) {
    console.warn(`${chain.name} has zero stablecoin MCap, showing only flow metric`)
  }
  if (flowValue === 0) {
    console.warn(`${chain.name} has zero revenue, showing only stock metric`)
  }

  // Fetch Ethos score and reviews from Twitter (with override support)
  let ethosScore = 0
  let reviewDistribution: ReviewDistribution | undefined
  const correctTwitterHandle = getCorrectTwitterHandle(chain.name, chain.twitter)

  if (correctTwitterHandle) {
    if (correctTwitterHandle !== chain.twitter) {
      console.log(`Using overridden Twitter handle for ${chain.name}: ${correctTwitterHandle} (was: ${chain.twitter})`)
    }

    try {
      // Fetch Ethos score
      const twitterData = await getUserScoreFromTwitter(correctTwitterHandle)
      if (twitterData) {
        ethosScore = twitterData.score
        console.log(`Ethos score for ${chain.name}: ${ethosScore}`)
      } else {
        console.warn(`Twitter user ${correctTwitterHandle} not found in Ethos for ${chain.name}`)
      }

      // Fetch reviews for distribution
      const reviewsData = await getReviewsByTwitter(correctTwitterHandle, 1000)
      if (reviewsData && reviewsData.reviews.length > 0) {
        reviewDistribution = calculateReviewDistribution(reviewsData.reviews)
        console.log(`Review distribution for ${chain.name}:`, reviewDistribution)
      } else {
        console.warn(`No reviews found for ${chain.name}`)
        reviewDistribution = { negative: 0, neutral: 0, positive: 0 }
      }
    } catch (error) {
      console.warn(`Failed to fetch Ethos data for ${chain.name}:`, error)
      reviewDistribution = { negative: 0, neutral: 0, positive: 0 }
    }
  } else {
    console.warn(`No Twitter handle for ${chain.name}`)
    reviewDistribution = { negative: 0, neutral: 0, positive: 0 }
  }

  // Return normalized card data
  return {
    name: chain.name,
    avatarUrl: chain.logo || undefined,
    ethosScore,
    category: "chain",
    tags: undefined,
    stockMetric: {
      label: "Stablecoin MCAP",
      valueUsd: stockValue
    },
    flowMetric: {
      label: "24h App Revenue",
      valueUsd: flowValue
    },
    reviewDistribution
  }
}

/**
 * Build all chain cards
 */
export async function buildAllChainCards(
  minMCap: number = 5_000_000
): Promise<ProtocolCardData[]> {
  console.log("Starting dynamic chain card generation...")

  // Step 1: Fetch and filter chains
  const chains = await fetchFilteredChains(minMCap)

  // Step 2: Build card data for each chain
  const cardDataPromises = chains.map(chain =>
    buildChainCardData(chain)
  )

  const cardDataResults = await Promise.all(cardDataPromises)

  // Filter out nulls
  const validCards = cardDataResults.filter((card): card is ProtocolCardData => card !== null)

  console.log(`Successfully built ${validCards.length}/${chains.length} chain cards`)

  return validCards
}
