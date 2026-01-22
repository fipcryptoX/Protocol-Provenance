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
  get7DayRevenueForChain,
  DefiLlamaChain
} from "./api/defillama-chains"
import { getUserScoreFromTwitter, getReviewsByTwitter, EthosReview } from "./api/ethos"
import { ProtocolCardData, ReviewDistribution } from "./protocol-data"
import { getCorrectTwitterHandle } from "./twitter-overrides"
import { getCorrectChainLogo } from "./chain-logo-overrides"

/**
 * Enriched chain with metrics
 */
export interface EnrichedChain {
  name: string
  stablecoinMCap: number
  logo: string | null
  twitter: string | null
  revenue7d: number
}

/**
 * Fetch and filter chains by Stablecoin MCap
 */
export async function fetchFilteredChains(
  minMCap: number = 5_000_000
): Promise<EnrichedChain[]> {
  console.log(`Fetching chains with Stablecoin MCap >= $${minMCap / 1_000_000}M...`)

  // Chains to exclude from the dashboard
  const excludedChains = new Set([
    'fantom',
  ])

  // Fetch all chains
  const allChains = await fetchAllChains()

  // Fetch stablecoin market cap for all chains
  const stableMCapByChain = await fetchStablecoinMCapByChain()

  // Filter by Stablecoin MCap
  const filtered = filterChainsByStablecoinMCap(allChains, stableMCapByChain, minMCap)
    .filter(chain => !excludedChains.has(chain.name.toLowerCase()))
  console.log(`Found ${filtered.length} chains with Stablecoin MCap >= $${minMCap / 1_000_000}M`)

  // Fetch 7-day revenue data for filtered chains in parallel
  console.log(`Fetching 7-day revenue data for ${filtered.length} chains...`)
  const revenuePromises = filtered.map(async (chain) => {
    const revenue7d = await get7DayRevenueForChain(chain.name)
    const correctLogo = getCorrectChainLogo(chain.name, chain.logo || null)

    return {
      name: chain.name,
      stablecoinMCap: chain.stablecoinMCap,
      logo: correctLogo,
      twitter: chain.twitter || null,
      revenue7d
    }
  })

  const enriched = await Promise.all(revenuePromises)
  console.log(`Enriched ${enriched.length} chains with 7-day revenue data`)
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
  console.log(`  Revenue 7d: $${chain.revenue7d.toLocaleString()}`)

  // Stock metric: Stablecoin MCap
  const stockValue = chain.stablecoinMCap
  if (stockValue === 0) {
    console.warn(`${chain.name} has zero stablecoin MCap, skipping`)
    return null
  }

  // Flow metric: App Revenue (7d)
  const flowValue = chain.revenue7d
  if (flowValue === 0) {
    console.warn(`${chain.name} has zero 7-day revenue, skipping`)
    return null
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

      // Fetch reviews for distribution (limit to 100 for dashboard performance)
      const reviewsData = await getReviewsByTwitter(correctTwitterHandle, 100)
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
      label: "7d App Revenue",
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
