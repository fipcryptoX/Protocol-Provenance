import { DefiLlamaCategory } from "@/lib/protocol-config"

const DEFILLAMA_API_BASE = "https://api.llama.fi"

export interface DefiLlamaProtocol {
  id: string
  name: string
  address?: string
  symbol?: string
  url?: string
  description?: string
  chain: string
  logo?: string
  audits?: string
  audit_note?: string
  gecko_id?: string
  cmcId?: string
  category: string
  chains: string[]
  module?: string
  twitter?: string
  forkedFrom?: string[]
  oracles?: string[]
  listedAt?: number
  methodology?: string
  slug: string
  tvl: number
  chainTvls: Record<string, number>
  change_1h?: number
  change_1d?: number
  change_7d?: number
  fdv?: number
  mcap?: number
}

export interface ProtocolMetrics {
  tvl: number
  revenue?: number
  volume?: number
  fees?: number
  openInterest?: number
  mcap?: number
}

/**
 * Raw response from DefiLlama perps endpoint
 */
export interface DefiLlamaPerpProtocol {
  name: string
  displayName?: string
  disabled?: boolean
  logo?: string
  chains?: string[]
  protocolType?: string
  methodology?: string
  openInterest?: number
  totalVolume24h?: number
  total24h?: number
  change_1d?: number
  [key: string]: any
}

export async function getProtocols(): Promise<DefiLlamaProtocol[]> {
  try {
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocols`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch protocols");
    }

    const protocols: DefiLlamaProtocol[] = await response.json();
    return protocols;
  } catch (error) {
    console.error("Error fetching DefiLlama protocols:", error);
    return [];
  }
}

export async function getProtocol(slug: string): Promise<DefiLlamaProtocol | null> {
  try {
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocol/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const protocol: DefiLlamaProtocol = await response.json();
    return protocol;
  } catch (error) {
    console.error(`Error fetching protocol ${slug}:`, error);
    return null;
  }
}

/**
 * Get protocol logo URL from DefiLlama
 *
 * @param protocolSlug - The protocol slug (e.g., "hyperliquid")
 * @returns Logo URL or null if not found
 */
export async function getProtocolLogo(
  protocolSlug: string
): Promise<string | null> {
  try {
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocol/${protocolSlug}`, {
      next: { revalidate: 120 }, // 2 minute cache
    })

    if (!response.ok) {
      console.warn(
        `Failed to fetch protocol ${protocolSlug} from DefiLlama: ${response.status}`
      )
      return null
    }

    const data = await response.json()

    if (!data.logo) {
      console.warn(`No logo found for protocol: ${protocolSlug}`)
      return null
    }

    console.log(`Logo URL found for ${protocolSlug}: ${data.logo}`)
    return data.logo
  } catch (error) {
    console.error(
      `Error fetching logo for ${protocolSlug}:`,
      error
    )
    return null
  }
}

export async function getProtocolRevenue(protocolName: string): Promise<number> {
  try {
    // DefiLlama fees/revenue endpoint
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/summary/fees/${protocolName}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    // Get 30d revenue if available
    return data.total30d || data.totalRevenue30d || 0;
  } catch (error) {
    console.error(`Error fetching revenue for ${protocolName}:`, error);
    return 0;
  }
}

export async function getProtocolVolume(protocolSlug: string): Promise<number> {
  try {
    // DEX volume endpoint
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/summary/dexs/${protocolSlug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.total30d || 0;
  } catch (error) {
    console.error(`Error fetching volume for ${protocolSlug}:`, error);
    return 0;
  }
}

export async function getProtocolMetrics(
  protocol: DefiLlamaProtocol
): Promise<ProtocolMetrics> {
  const metrics: ProtocolMetrics = {
    tvl: protocol.tvl || 0,
    mcap: protocol.mcap || 0,
  };

  // Fetch additional metrics based on category
  try {
    const [revenue, volume] = await Promise.all([
      getProtocolRevenue(protocol.slug),
      getProtocolVolume(protocol.slug),
    ]);

    metrics.revenue = revenue;
    metrics.volume = volume;
  } catch (error) {
    console.error(`Error fetching metrics for ${protocol.name}:`, error);
  }

  return metrics;
}

/**
 * Fetch open interest data from DefiLlama
 *
 * @returns Array of protocols with open interest data
 */
export async function getOpenInterestData(): Promise<any[]> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/overview/open-interest`,
      {
        next: { revalidate: 120 }, // 2 minute cache
      }
    )

    if (!response.ok) {
      console.warn(`Failed to fetch open interest data: ${response.status}`)
      return []
    }

    const data = await response.json()
    // The API returns an object with protocols array
    return data.protocols || []
  } catch (error) {
    console.error(`Error fetching open interest data:`, error)
    return []
  }
}

/**
 * Fetch derivatives/perps protocol data for a specific protocol
 *
 * @param protocolSlug - The protocol slug (e.g., "hyperliquid")
 * @returns Protocol derivatives data including volume and open interest
 */
export async function getDerivativesProtocol(
  protocolSlug: string
): Promise<DefiLlamaPerpProtocol | null> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/summary/derivatives/${protocolSlug}`,
      {
        next: { revalidate: 120 }, // 2 minute cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch derivatives data for ${protocolSlug}: ${response.status}`
      )
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching derivatives data for ${protocolSlug}:`, error)
    return null
  }
}

/**
 * Category-aware fetching for DefiLlama data
 *
 * This function fetches protocol data based on category (perps, dex, lending, bridge).
 * It returns the raw data structure specific to that category.
 *
 * @param category - The DefiLlama category to fetch
 * @returns Array of category-specific protocol data
 */
export async function fetchDefiLlamaCategory(
  category: DefiLlamaCategory
): Promise<any[]> {
  try {
    let endpoint: string

    switch (category) {
      case "perps":
        endpoint = `${DEFILLAMA_API_BASE}/overview/derivatives?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume`
        break
      case "dex":
        endpoint = `${DEFILLAMA_API_BASE}/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume`
        break
      case "lending":
        endpoint = `${DEFILLAMA_API_BASE}/protocols`
        break
      case "bridge":
        endpoint = `${DEFILLAMA_API_BASE}/bridges?includeChains=true`
        break
      default:
        throw new Error(`Unsupported category: ${category}`)
    }

    const response = await fetch(endpoint, {
      next: { revalidate: 120 }, // 2 minute cache as per PRD
    })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${category} data: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()

    // Handle different response structures
    if (category === "perps" || category === "dex") {
      return data.protocols || []
    }

    return data
  } catch (error) {
    console.error(`Error fetching DefiLlama ${category} data:`, error)
    throw error
  }
}

/**
 * Extract metric value from category-specific data
 *
 * @param protocolSlug - The protocol slug to search for
 * @param category - The category being queried
 * @param fieldName - The field to extract from the data
 * @returns The metric value or null if not found
 */
export async function getMetricFromCategory(
  protocolSlug: string,
  category: DefiLlamaCategory,
  fieldName: string
): Promise<number | null> {
  try {
    // For open interest metrics, use the open interest endpoint
    if (fieldName === "dailyOpenInterest" || fieldName === "openInterest") {
      const protocols = await getOpenInterestData()

      console.log(`Searching for ${protocolSlug} in open interest data...`)

      // Find the protocol by name or displayName matching the slug
      const protocolData = protocols.find((p: any) => {
        const slug = protocolSlug.toLowerCase()
        const name = p.name?.toLowerCase() || ""
        const displayName = p.displayName?.toLowerCase() || ""

        // Match by exact name, displayName, or if displayName contains the slug
        return (
          name === slug ||
          displayName === slug ||
          displayName.includes(slug) ||
          displayName === `${slug} perps`
        )
      })

      if (!protocolData) {
        console.warn(
          `Protocol ${protocolSlug} not found in open interest data`
        )
        // Log available protocols for debugging
        console.log(
          `Available protocols (first 10):`,
          protocols.slice(0, 10).map(p => ({
            name: p.name,
            displayName: p.displayName
          }))
        )
        return null
      }

      console.log(`Found protocol: ${protocolData.displayName || protocolData.name}`)

      // Extract the field value (use total24h for 24h open interest)
      const value = protocolData.total24h || protocolData.dailyOpenInterest || protocolData.openInterest

      if (typeof value !== "number") {
        console.warn(
          `Open interest field not found or not a number for ${protocolSlug}`
        )
        return null
      }

      console.log(`Open interest for ${protocolSlug}: ${value}`)
      return value
    }

    // For perps volume metrics, use the dedicated derivatives endpoint
    if (category === "perps") {
      const protocolData = await getDerivativesProtocol(protocolSlug)

      if (!protocolData) {
        console.warn(`Failed to fetch derivatives data for ${protocolSlug}`)
        return null
      }

      // Extract the field value
      const value = protocolData[fieldName]

      if (typeof value !== "number") {
        console.warn(
          `Field ${fieldName} not found or not a number for ${protocolSlug}`
        )
        return null
      }

      return value
    }

    // For other categories, use the overview endpoint
    const data = await fetchDefiLlamaCategory(category)

    // Find the protocol in the data
    const protocolData = data.find(
      (p: any) =>
        p.name?.toLowerCase() === protocolSlug.toLowerCase() ||
        p.displayName?.toLowerCase() === protocolSlug.toLowerCase()
    )

    if (!protocolData) {
      console.warn(
        `Protocol ${protocolSlug} not found in ${category} category data`
      )
      return null
    }

    // Extract the field value
    const value = protocolData[fieldName]

    if (typeof value !== "number") {
      console.warn(
        `Field ${fieldName} not found or not a number for ${protocolSlug}`
      )
      return null
    }

    return value
  } catch (error) {
    console.error(
      `Error getting metric ${fieldName} for ${protocolSlug}:`,
      error
    )
    return null
  }
}

/**
 * Historical data point with timestamp and value
 */
export interface HistoricalDataPoint {
  timestamp: number
  value: number
}

/**
 * Get historical TVL data for a protocol
 *
 * @param protocolSlug - The protocol slug (e.g., "aave", "uniswap")
 * @returns Array of historical TVL data points
 */
export async function getHistoricalTVL(
  protocolSlug: string
): Promise<HistoricalDataPoint[]> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/protocol/${protocolSlug}`,
      {
        next: { revalidate: 3600 }, // 1 hour cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch historical TVL for ${protocolSlug}: ${response.status}`
      )
      return []
    }

    const data = await response.json()

    // Extract TVL time series from chainTvls or tvl array
    let tvlData: Array<{ date: number; totalLiquidityUSD: number }> = []

    if (data.chainTvls) {
      // Get combined TVL from all chains
      const combinedKey = Object.keys(data.chainTvls).find(
        (key) => key.toLowerCase() === protocolSlug.toLowerCase() || key === "tvl"
      )
      if (combinedKey && data.chainTvls[combinedKey]?.tvl) {
        tvlData = data.chainTvls[combinedKey].tvl
      }
    }

    // Fallback to direct tvl array
    if (tvlData.length === 0 && data.tvl) {
      tvlData = data.tvl
    }

    // Convert to standard format
    return tvlData.map((point) => ({
      timestamp: point.date,
      value: point.totalLiquidityUSD,
    }))
  } catch (error) {
    console.error(`Error fetching historical TVL for ${protocolSlug}:`, error)
    return []
  }
}

/**
 * Get historical fees/revenue data for a protocol
 *
 * @param protocolSlug - The protocol slug (e.g., "aave", "uniswap")
 * @returns Array of historical revenue data points
 */
export async function getHistoricalFees(
  protocolSlug: string
): Promise<HistoricalDataPoint[]> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/summary/fees/${protocolSlug}`,
      {
        next: { revalidate: 3600 }, // 1 hour cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch historical fees for ${protocolSlug}: ${response.status}`
      )
      return []
    }

    const data = await response.json()

    // Extract totalDataChart which contains [timestamp, value] pairs
    if (!data.totalDataChart || !Array.isArray(data.totalDataChart)) {
      console.warn(`No totalDataChart found for ${protocolSlug}`)
      return []
    }

    // Convert [timestamp, value] pairs to objects
    return data.totalDataChart.map(([timestamp, value]: [number, number]) => ({
      timestamp,
      value,
    }))
  } catch (error) {
    console.error(`Error fetching historical fees for ${protocolSlug}:`, error)
    return []
  }
}

/**
 * Get historical stablecoin market cap for stablecoin protocols
 *
 * @param chain - Chain name or "all" for all chains
 * @returns Array of historical stablecoin data points
 */
export async function getHistoricalStablecoinMcap(
  chain: string = "all"
): Promise<HistoricalDataPoint[]> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/stablecoincharts/${chain}`,
      {
        next: { revalidate: 3600 }, // 1 hour cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch historical stablecoin data for ${chain}: ${response.status}`
      )
      return []
    }

    const data = await response.json()

    // The API returns an array of data points
    if (!Array.isArray(data)) {
      console.warn(`Invalid stablecoin data format for ${chain}`)
      return []
    }

    // Convert to standard format
    return data.map((point: any) => ({
      timestamp: point.date || point.timestamp,
      value: point.totalCirculatingUSD || point.value || 0,
    }))
  } catch (error) {
    console.error(
      `Error fetching historical stablecoin data for ${chain}:`,
      error
    )
    return []
  }
}
