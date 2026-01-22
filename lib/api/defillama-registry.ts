/**
 * DefiLlama Base Protocol Registry API Client
 *
 * Fetches the foundation protocol data including TVL, category, logo, twitter, etc.
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
 * Protocol data from /protocols endpoint
 */
export interface DefiLlamaProtocol {
  id: string
  name: string
  address: string | null
  symbol: string
  url: string
  description: string
  chain: string
  logo: string | null
  audits: string
  audit_note: string | null
  gecko_id: string | null
  cmcId: string | null
  category: string
  chains: string[]
  module: string
  twitter: string | null
  forkedFrom: string[]
  oracles: string[]
  listedAt: number
  slug: string
  tvl: number
  chainTvls: Record<string, number>
  change_1h: number | null
  change_1d: number | null
  change_7d: number | null
  tokenBreakdowns: Record<string, any>
  mcap: number | null
}

/**
 * Fetch all protocols from DefiLlama registry
 */
export async function fetchAllProtocols(): Promise<DefiLlamaProtocol[]> {
  const cacheKey = "defillama-protocols"
  const cached = getCached<DefiLlamaProtocol[]>(cacheKey)

  if (cached) {
    console.log("Using cached protocols data")
    return cached
  }

  console.log("Fetching protocols from DefiLlama API...")

  try {
    const response = await fetch("https://api.llama.fi/protocols", {
      next: { revalidate: 120 } // Cache for 2 minutes in Next.js
    })

    if (!response.ok) {
      throw new Error(`DefiLlama API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Fetched ${data.length} protocols from DefiLlama`)

    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error("Error fetching protocols from DefiLlama:", error)
    // Return empty array on error to allow build to continue
    return []
  }
}

/**
 * Filter protocols by minimum TVL
 */
export function filterByTVL(
  protocols: DefiLlamaProtocol[],
  minTVL: number = 10_000_000_000 // $10B default
): DefiLlamaProtocol[] {
  return protocols.filter(p => p.tvl >= minTVL)
}

/**
 * Get protocol by slug
 */
export function getProtocolBySlug(
  protocols: DefiLlamaProtocol[],
  slug: string
): DefiLlamaProtocol | undefined {
  return protocols.find(p => p.slug.toLowerCase() === slug.toLowerCase())
}

/**
 * Group protocols by category
 */
export function groupByCategory(
  protocols: DefiLlamaProtocol[]
): Record<string, DefiLlamaProtocol[]> {
  return protocols.reduce((acc, protocol) => {
    const category = protocol.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(protocol)
    return acc
  }, {} as Record<string, DefiLlamaProtocol[]>)
}
