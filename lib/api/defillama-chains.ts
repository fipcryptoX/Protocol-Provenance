/**
 * DefiLlama Chains API
 *
 * Fetches chain data with TVL and joins with revenue data
 */

const CACHE_DURATION_MS = 2 * 60 * 1000 // 2 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION_MS
  if (isExpired) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Chain data structure from /chains endpoint
 */
export interface DefiLlamaChain {
  name: string
  chainId?: number
  tvl: number
  tokenSymbol?: string
  cmcId?: string
  gecko_id?: string
  logo?: string | null
  twitter?: string | null
  [key: string]: any
}

/**
 * Chain revenue data from /overview/revenue
 */
export interface ChainRevenue {
  name: string
  displayName?: string
  total24h: number | null
  total7d?: number | null
  total30d?: number | null
  [key: string]: any
}

/**
 * Fetch all chains from DefiLlama
 */
export async function fetchAllChains(): Promise<DefiLlamaChain[]> {
  const cacheKey = "defillama-chains"
  const cached = getCached<DefiLlamaChain[]>(cacheKey)

  if (cached) {
    console.log("Using cached chains data")
    return cached
  }

  console.log("Fetching chains from DefiLlama...")

  try {
    const response = await fetch("https://api.llama.fi/chains", {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      throw new Error(`DefiLlama chains API error: ${response.status}`)
    }

    const data = await response.json()
    const chains = Array.isArray(data) ? data : []
    console.log(`Fetched ${chains.length} chains`)

    setCache(cacheKey, chains)
    return chains
  } catch (error) {
    console.error("Error fetching chains:", error)
    return []
  }
}

/**
 * Fetch revenue for a specific chain
 */
async function fetchChainSpecificRevenue(chainName: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.llama.fi/overview/fees/${encodeURIComponent(chainName)}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`,
      { next: { revalidate: 120 } }
    )

    if (!response.ok) {
      return 0
    }

    const data = await response.json()
    return data.total24h || 0
  } catch (error) {
    console.error(`Error fetching revenue for ${chainName}:`, error)
    return 0
  }
}

/**
 * Fetch chain revenue data for multiple chains in parallel
 */
export async function fetchChainRevenue(chains: DefiLlamaChain[]): Promise<Record<string, number>> {
  console.log(`Fetching revenue data for ${chains.length} chains...`)

  const revenuePromises = chains.map(async (chain) => {
    const revenue = await fetchChainSpecificRevenue(chain.name)
    return { name: chain.name, revenue }
  })

  const results = await Promise.all(revenuePromises)

  const revenueByChain: Record<string, number> = {}
  for (const { name, revenue } of results) {
    revenueByChain[name] = revenue
  }

  console.log(`Fetched revenue data for ${Object.keys(revenueByChain).length} chains`)
  return revenueByChain
}

/**
 * Stablecoin chain data from /stablecoinchains endpoint
 */
interface StablecoinChainData {
  name: string
  totalCirculatingUSD: {
    peggedUSD: number
    [key: string]: any
  }
  [key: string]: any
}

/**
 * Fetch stablecoin market cap by chain
 */
export async function fetchStablecoinMCapByChain(): Promise<Record<string, number>> {
  const cacheKey = "defillama-stablecoin-mcap-by-chain"
  const cached = getCached<Record<string, number>>(cacheKey)

  if (cached) {
    console.log("Using cached stablecoin MCap by chain data")
    return cached
  }

  console.log("Fetching stablecoin market caps by chain...")

  try {
    const response = await fetch("https://stablecoins.llama.fi/stablecoinchains", {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      throw new Error(`DefiLlama stablecoinchains API error: ${response.status}`)
    }

    const chains: StablecoinChainData[] = await response.json()

    // Build map of chain name -> stablecoin MCap
    const stableMCapByChain: Record<string, number> = {}

    for (const chain of chains) {
      if (chain.totalCirculatingUSD?.peggedUSD) {
        stableMCapByChain[chain.name] = chain.totalCirculatingUSD.peggedUSD
      }
    }

    console.log(`Fetched stablecoin MCap for ${Object.keys(stableMCapByChain).length} chains`)

    setCache(cacheKey, stableMCapByChain)
    return stableMCapByChain
  } catch (error) {
    console.error("Error fetching stablecoin MCap by chain:", error)
    return {}
  }
}

/**
 * Filter chains by minimum stablecoin market cap
 */
export function filterChainsByStablecoinMCap(
  chains: DefiLlamaChain[],
  stableMCapByChain: Record<string, number>,
  minMCap: number = 5_000_000_000
): Array<DefiLlamaChain & { stablecoinMCap: number }> {
  return chains
    .map(chain => ({
      ...chain,
      stablecoinMCap: stableMCapByChain[chain.name] || 0
    }))
    .filter(chain => chain.stablecoinMCap >= minMCap)
}

/**
 * Filter chains by minimum TVL (legacy, kept for compatibility)
 */
export function filterChainsByTVL(
  chains: DefiLlamaChain[],
  minTVL: number = 4_000_000_000
): DefiLlamaChain[] {
  return chains.filter(chain => chain.tvl >= minTVL)
}

/**
 * Helper: Find chain revenue by name (case-insensitive with normalization)
 */
export function findChainRevenue(
  revenueByChain: Record<string, number>,
  chainName: string
): number {
  const normalizedName = chainName.toLowerCase().trim()

  // Try exact match first
  for (const [key, value] of Object.entries(revenueByChain)) {
    if (key.toLowerCase().trim() === normalizedName) {
      return value
    }
  }

  // Try partial match
  for (const [key, value] of Object.entries(revenueByChain)) {
    const keyLower = key.toLowerCase().trim()
    if (keyLower.includes(normalizedName) || normalizedName.includes(keyLower)) {
      return value
    }
  }

  return 0
}

/**
 * Historical data point
 */
export interface HistoricalDataPoint {
  timestamp: number
  value: number
}

/**
 * Get historical stablecoin MCap for a specific chain
 */
export async function getHistoricalStablecoinMcapForChain(
  chainName: string
): Promise<HistoricalDataPoint[]> {
  try {
    const response = await fetch(
      `https://stablecoins.llama.fi/stablecoincharts/${encodeURIComponent(chainName)}`,
      { cache: "no-store" }
    )

    if (!response.ok) {
      console.warn(`Failed to fetch historical stablecoin data for ${chainName}: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.warn(`Invalid stablecoin data format for ${chainName}`)
      return []
    }

    // Convert to standard format
    return data.map((point: any) => ({
      timestamp: point.date || point.timestamp,
      value: point.totalCirculating?.peggedUSD || 0,
    }))
  } catch (error) {
    console.error(`Error fetching historical stablecoin data for ${chainName}:`, error)
    return []
  }
}

/**
 * Get historical app revenue for a specific chain
 */
export async function getHistoricalRevenueForChain(
  chainName: string
): Promise<HistoricalDataPoint[]> {
  try {
    const response = await fetch(
      `https://api.llama.fi/overview/fees/${encodeURIComponent(chainName)}`,
      { cache: "no-store" }
    )

    if (!response.ok) {
      console.warn(`Failed to fetch historical revenue for ${chainName}: ${response.status}`)
      return []
    }

    const data = await response.json()

    // Extract totalDataChart which contains [timestamp, value] pairs
    if (!data.totalDataChart || !Array.isArray(data.totalDataChart)) {
      console.warn(`No totalDataChart found for ${chainName}`)
      return []
    }

    // Convert [timestamp, value] pairs to objects
    return data.totalDataChart.map(([timestamp, value]: [number, number]) => ({
      timestamp,
      value,
    }))
  } catch (error) {
    console.error(`Error fetching historical revenue for ${chainName}:`, error)
    return []
  }
}
