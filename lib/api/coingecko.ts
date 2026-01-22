/**
 * CoinGecko API Integration
 *
 * Fetches coin data including Twitter usernames using gecko_id from DeFiLlama
 */

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || 'CG-J4a4o3v2tsmn79a8wNXBKrdu'
const CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes

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
 * CoinGecko coin data structure (partial)
 */
export interface CoinGeckoData {
  id: string
  symbol: string
  name: string
  links: {
    homepage: string[]
    blockchain_site: string[]
    twitter_screen_name: string | null
    telegram_channel_identifier: string | null
    [key: string]: any
  }
  image?: {
    thumb: string
    small: string
    large: string
  }
  [key: string]: any
}

/**
 * Fetch coin data from CoinGecko by gecko_id
 */
export async function fetchCoinGeckoData(
  geckoId: string
): Promise<CoinGeckoData | null> {
  const cacheKey = `coingecko-${geckoId}`
  const cached = getCached<CoinGeckoData>(cacheKey)

  if (cached) {
    return cached
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${geckoId}`
    const headers: HeadersInit = {
      'accept': 'application/json'
    }

    // Add API key if available
    if (COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
    }

    const response = await fetch(url, {
      headers,
      next: { revalidate: 1800 } // 30 minutes
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`CoinGecko: Coin not found for gecko_id: ${geckoId}`)
        return null
      }
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoData = await response.json()
    setCache(cacheKey, data)

    return data
  } catch (error) {
    console.error(`Error fetching CoinGecko data for ${geckoId}:`, error)
    return null
  }
}

/**
 * Get Twitter username from CoinGecko using gecko_id
 */
export async function getTwitterFromGeckoId(
  geckoId: string
): Promise<string | null> {
  const cacheKey = `coingecko-twitter-${geckoId}`
  const cached = getCached<string | null>(cacheKey)

  if (cached !== undefined) {
    return cached
  }

  try {
    const coinData = await fetchCoinGeckoData(geckoId)

    if (!coinData) {
      setCache(cacheKey, null)
      return null
    }

    const twitterHandle = coinData.links?.twitter_screen_name || null

    if (twitterHandle) {
      console.log(`CoinGecko: Found Twitter handle for ${geckoId}: @${twitterHandle}`)
    } else {
      console.warn(`CoinGecko: No Twitter handle found for ${geckoId}`)
    }

    setCache(cacheKey, twitterHandle)
    return twitterHandle
  } catch (error) {
    console.error(`Error fetching Twitter handle for ${geckoId}:`, error)
    setCache(cacheKey, null)
    return null
  }
}

/**
 * Batch fetch Twitter handles for multiple gecko_ids with rate limiting
 */
export async function batchGetTwitterFromGeckoIds(
  geckoIds: string[]
): Promise<Record<string, string | null>> {
  console.log(`Fetching Twitter handles from CoinGecko for ${geckoIds.length} coins...`)

  const twitterByGeckoId: Record<string, string | null> = {}

  // Process in batches of 5 with 3000ms delay to respect demo API rate limits
  const BATCH_SIZE = 5
  const DELAY_MS = 3000

  for (let i = 0; i < geckoIds.length; i += BATCH_SIZE) {
    const batch = geckoIds.slice(i, i + BATCH_SIZE)

    console.log(`Fetching CoinGecko Twitter handles: batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(geckoIds.length / BATCH_SIZE)}...`)

    const results = await Promise.all(
      batch.map(async (geckoId) => {
        const twitter = await getTwitterFromGeckoId(geckoId)
        return { geckoId, twitter }
      })
    )

    for (const { geckoId, twitter } of results) {
      twitterByGeckoId[geckoId] = twitter
    }

    // Add delay between batches (except for the last batch)
    if (i + BATCH_SIZE < geckoIds.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }

  const foundCount = Object.values(twitterByGeckoId).filter(t => t !== null).length
  console.log(`CoinGecko: Found ${foundCount}/${geckoIds.length} Twitter handles`)

  return twitterByGeckoId
}

/**
 * Get logo URL from CoinGecko using gecko_id
 */
export async function getLogoFromGeckoId(
  geckoId: string
): Promise<string | null> {
  const cacheKey = `coingecko-logo-${geckoId}`
  const cached = getCached<string | null>(cacheKey)

  if (cached !== undefined) {
    return cached
  }

  try {
    const coinData = await fetchCoinGeckoData(geckoId)

    if (!coinData) {
      console.warn(`CoinGecko: No coin data returned for ${geckoId}`)
      setCache(cacheKey, null)
      return null
    }

    if (!coinData.image) {
      console.warn(`CoinGecko: No image field for ${geckoId}`)
      setCache(cacheKey, null)
      return null
    }

    if (!coinData.image.large) {
      console.warn(`CoinGecko: No large image for ${geckoId}`)
      setCache(cacheKey, null)
      return null
    }

    const logoUrl = coinData.image.large

    console.log(`CoinGecko: Found logo for ${geckoId}: ${logoUrl}`)
    setCache(cacheKey, logoUrl)
    return logoUrl
  } catch (error) {
    console.error(`Error fetching logo for ${geckoId}:`, error)
    setCache(cacheKey, null)
    return null
  }
}

/**
 * Batch fetch logo URLs for multiple gecko_ids with rate limiting
 */
export async function batchGetLogosFromGeckoIds(
  geckoIds: string[]
): Promise<Record<string, string | null>> {
  console.log(`Fetching logos from CoinGecko for ${geckoIds.length} coins...`)

  const logosByGeckoId: Record<string, string | null> = {}

  // Process in batches of 5 with 3000ms delay to respect demo API rate limits
  // Demo tier: ~10-30 calls/minute, so we target 20 calls/minute = 1 batch (5 calls) every 15 seconds
  const BATCH_SIZE = 5
  const DELAY_MS = 3000 // 3 seconds between batches

  for (let i = 0; i < geckoIds.length; i += BATCH_SIZE) {
    const batch = geckoIds.slice(i, i + BATCH_SIZE)

    console.log(`Fetching CoinGecko logos: batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(geckoIds.length / BATCH_SIZE)}...`)

    const results = await Promise.all(
      batch.map(async (geckoId) => {
        const logo = await getLogoFromGeckoId(geckoId)
        return { geckoId, logo }
      })
    )

    for (const { geckoId, logo } of results) {
      logosByGeckoId[geckoId] = logo
    }

    // Add delay between batches (except for the last batch)
    if (i + BATCH_SIZE < geckoIds.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }

  const foundCount = Object.values(logosByGeckoId).filter(l => l !== null).length
  console.log(`CoinGecko: Found ${foundCount}/${geckoIds.length} logos`)

  return logosByGeckoId
}
