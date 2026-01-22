/**
 * DefiLlama Data Aggregation Service
 *
 * Fetches all required datasets in parallel:
 * - Open Interest
 * - Derivatives (Perps Volume)
 * - DEXes (Trading Volume)
 * - Revenue
 * - Stablecoins
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
 * Open Interest data structure
 */
export interface OpenInterestProtocol {
  displayName: string
  totalOpenInterest: number
  dailyOpenInterest?: number
  [key: string]: any
}

/**
 * Derivatives (Perps) data structure
 */
export interface DerivativesProtocol {
  displayName: string
  total24h?: number
  total7d?: number
  total30d?: number
  totalAllTime?: number
  [key: string]: any
}

/**
 * DEX data structure
 */
export interface DexProtocol {
  displayName: string
  name: string
  disabled: boolean
  total24h?: number
  total7d?: number
  total30d?: number
  totalAllTime?: number
  [key: string]: any
}

/**
 * Revenue data structure
 */
export interface RevenueProtocol {
  displayName: string
  name: string
  logo: string | null
  revenue24h: number | null
  revenue7d: number | null
  revenue30d: number | null
  [key: string]: any
}

/**
 * Stablecoin data structure
 */
export interface Stablecoin {
  id: string
  name: string
  symbol: string
  gecko_id: string | null
  pegType: string
  priceSource: string
  pegMechanism: string
  circulating: Record<string, number>
  circulatingPrevDay: Record<string, number>
  circulatingPrevWeek: Record<string, number>
  circulatingPrevMonth: Record<string, number>
  chains: string[]
  [key: string]: any
}

/**
 * Aggregated datasets
 */
export interface AggregatedData {
  openInterest: OpenInterestProtocol[]
  derivatives: DerivativesProtocol[]
  dexes: DexProtocol[]
  revenue: RevenueProtocol[]
  stablecoins: Stablecoin[]
}

/**
 * Fetch open interest data
 *
 * Note: The API returns an array directly, not nested in an object
 */
async function fetchOpenInterest(): Promise<OpenInterestProtocol[]> {
  const cacheKey = "defillama-open-interest"
  const cached = getCached<OpenInterestProtocol[]>(cacheKey)

  if (cached) {
    console.log("Using cached open interest data")
    return cached
  }

  console.log("Fetching open interest from DefiLlama...")

  try {
    const response = await fetch("https://api.llama.fi/overview/options", {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      console.warn(`DefiLlama options API returned ${response.status}, trying derivatives instead...`)

      // Fallback: use derivatives endpoint which has open interest data
      const derivResponse = await fetch("https://api.llama.fi/overview/derivatives", {
        next: { revalidate: 120 }
      })

      if (!derivResponse.ok) {
        console.warn("Derivatives endpoint also failed, returning empty array")
        return []
      }

      const derivData = await derivResponse.json()
      const protocols = derivData.protocols || []
      console.log(`Fetched ${protocols.length} protocols with open interest from derivatives endpoint`)

      setCache(cacheKey, protocols)
      return protocols
    }

    const data = await response.json()
    const protocols = Array.isArray(data) ? data : (data.protocols || [])
    console.log(`Fetched ${protocols.length} open interest protocols`)

    setCache(cacheKey, protocols)
    return protocols
  } catch (error) {
    console.error("Error fetching open interest:", error)
    return []
  }
}

/**
 * Fetch derivatives (perps volume) data
 */
async function fetchDerivatives(): Promise<DerivativesProtocol[]> {
  const cacheKey = "defillama-derivatives"
  const cached = getCached<DerivativesProtocol[]>(cacheKey)

  if (cached) {
    console.log("Using cached derivatives data")
    return cached
  }

  console.log("Fetching derivatives from DefiLlama...")

  try {
    const response = await fetch("https://api.llama.fi/overview/derivatives", {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      throw new Error(`DefiLlama derivatives API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Fetched ${data.protocols?.length || 0} derivatives protocols`)

    setCache(cacheKey, data.protocols || [])
    return data.protocols || []
  } catch (error) {
    console.error("Error fetching derivatives:", error)
    return []
  }
}

/**
 * Fetch DEX (trading volume) data
 */
async function fetchDexes(): Promise<DexProtocol[]> {
  const cacheKey = "defillama-dexes"
  const cached = getCached<DexProtocol[]>(cacheKey)

  if (cached) {
    console.log("Using cached DEX data")
    return cached
  }

  console.log("Fetching DEXes from DefiLlama...")

  try {
    const response = await fetch("https://api.llama.fi/overview/dexes", {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      console.warn(`DefiLlama dexes API returned ${response.status}, continuing without DEX data`)
      return []
    }

    const data = await response.json()
    console.log(`Fetched ${data.protocols?.length || 0} DEX protocols`)

    setCache(cacheKey, data.protocols || [])
    return data.protocols || []
  } catch (error) {
    console.error("Error fetching DEXes:", error)
    return []
  }
}

/**
 * Fetch revenue data (using fees endpoint as fallback)
 */
async function fetchRevenue(): Promise<RevenueProtocol[]> {
  const cacheKey = "defillama-revenue"
  const cached = getCached<RevenueProtocol[]>(cacheKey)

  if (cached) {
    console.log("Using cached revenue data")
    return cached
  }

  console.log("Fetching revenue from DefiLlama (using fees endpoint)...")

  try {
    const response = await fetch("https://api.llama.fi/overview/fees", {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      console.warn(`DefiLlama fees API returned ${response.status}, returning empty array`)
      return []
    }

    const data = await response.json()
    console.log(`Fetched ${data.protocols?.length || 0} fee/revenue protocols`)

    setCache(cacheKey, data.protocols || [])
    return data.protocols || []
  } catch (error) {
    console.error("Error fetching revenue:", error)
    return []
  }
}

/**
 * Fetch stablecoins data
 */
async function fetchStablecoins(): Promise<Stablecoin[]> {
  const cacheKey = "defillama-stablecoins"
  const cached = getCached<Stablecoin[]>(cacheKey)

  if (cached) {
    console.log("Using cached stablecoins data")
    return cached
  }

  console.log("Fetching stablecoins from DefiLlama...")

  try {
    const response = await fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      console.warn(`DefiLlama stablecoins API returned ${response.status}, returning empty array`)
      return []
    }

    const data = await response.json()
    console.log(`Fetched ${data.peggedAssets?.length || 0} stablecoins`)

    setCache(cacheKey, data.peggedAssets || [])
    return data.peggedAssets || []
  } catch (error) {
    console.error("Error fetching stablecoins:", error)
    return []
  }
}

/**
 * Fetch all datasets in parallel
 */
export async function fetchAllData(): Promise<AggregatedData> {
  console.log("Fetching all DefiLlama datasets in parallel...")

  const [openInterest, derivatives, dexes, revenue, stablecoins] = await Promise.all([
    fetchOpenInterest(),
    fetchDerivatives(),
    fetchDexes(),
    fetchRevenue(),
    fetchStablecoins(),
  ])

  console.log("All datasets fetched successfully")

  return {
    openInterest,
    derivatives,
    dexes,
    revenue,
    stablecoins,
  }
}

/**
 * Helper: Find protocol in dataset by name (case-insensitive)
 * Tries multiple matching strategies
 */
export function findProtocolByName<T extends { displayName?: string; name?: string }>(
  protocols: T[],
  name: string
): T | undefined {
  const normalizedName = name.toLowerCase().trim()

  // Try exact match first
  let match = protocols.find(p => {
    const pName = (p.displayName || p.name || "").toLowerCase().trim()
    return pName === normalizedName
  })

  if (match) return match

  // Try removing version numbers and common suffixes
  const cleanedName = normalizedName
    .replace(/\s+v\d+$/i, "") // Remove " V3", " V2", etc.
    .replace(/\s+\d+$/i, "") // Remove trailing numbers

  match = protocols.find(p => {
    const pName = (p.displayName || p.name || "").toLowerCase().trim()
    const pCleaned = pName.replace(/\s+v\d+$/i, "").replace(/\s+\d+$/i, "")
    return pCleaned === cleanedName
  })

  if (match) return match

  // Try partial match (contains)
  match = protocols.find(p => {
    const pName = (p.displayName || p.name || "").toLowerCase().trim()
    return pName.includes(normalizedName) || normalizedName.includes(pName)
  })

  return match
}
