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
