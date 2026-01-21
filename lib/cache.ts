/**
 * Client-side cache utility with TTL support
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ClientCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  /**
   * Get item from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set item in cache with TTL (time to live in milliseconds)
   */
  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Clear specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

// Singleton instance
export const cache = new ClientCache()

/**
 * Wrapper function for caching async operations
 *
 * @param key - Cache key
 * @param fetcher - Async function to fetch data
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns Cached or fresh data
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    console.log(`Cache hit for key: ${key}`)
    return cached
  }

  // Fetch fresh data
  console.log(`Cache miss for key: ${key}, fetching...`)
  const data = await fetcher()

  // Store in cache
  cache.set(key, data, ttl)

  return data
}
