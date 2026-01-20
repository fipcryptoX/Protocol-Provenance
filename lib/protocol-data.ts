/**
 * Protocol Data Normalization Layer
 *
 * This module is responsible for:
 * 1. Fetching data from Ethos, DefiLlama, and protocol-specific APIs
 * 2. Normalizing the data into the ProtocolCardData contract
 * 3. Handling errors and providing explicit error states
 *
 * The UI must not know about API sources, protocol categories, or fetching logic.
 * All protocol-specific decisions are driven by configuration.
 */

import { ProtocolConfig } from "@/lib/protocol-config"
import { getEthosData } from "@/lib/api/ethos"
import { getMetricFromCategory } from "@/lib/api/defillama"
import {
  getHyperliquidTotalOpenInterest,
  getHyperliquid24hVolume,
} from "@/lib/api/hyperliquid"

/**
 * Normalized protocol data contract for the UI
 * This is the ONLY data structure the UI should consume
 */
export interface ProtocolCardData {
  name: string
  avatarUrl?: string
  ethosScore: number
  stockMetric: {
    label: string
    valueUsd: number
  }
  flowMetric: {
    label: string
    valueUsd: number
  }
}

/**
 * Fetch a metric value based on source configuration
 */
async function fetchMetricValue(
  source: "defillama" | "hyperliquid",
  field: string,
  protocolSlug?: string,
  category?: string
): Promise<number> {
  if (source === "hyperliquid") {
    // Use Hyperliquid's own API
    if (field === "totalOpenInterest") {
      return await getHyperliquidTotalOpenInterest()
    } else if (field === "total24hVolume") {
      return await getHyperliquid24hVolume()
    } else {
      throw new Error(`Unknown Hyperliquid field: ${field}`)
    }
  } else if (source === "defillama") {
    // Use DefiLlama API
    if (!protocolSlug || !category) {
      throw new Error("DefiLlama source requires protocolSlug and category")
    }
    const value = await getMetricFromCategory(protocolSlug, category as any, field)
    if (value === null) {
      throw new Error(`Failed to fetch ${field} from DefiLlama`)
    }
    return value
  } else {
    throw new Error(`Unknown metric source: ${source}`)
  }
}

/**
 * Fetch and normalize protocol data based on configuration
 *
 * This function:
 * - Fetches Ethos identity data (name, avatar, score)
 * - Fetches metrics from configured sources (DefiLlama, Hyperliquid, etc.)
 * - Normalizes everything into ProtocolCardData contract
 * - Throws explicit errors if data cannot be fetched
 *
 * @param config - Protocol configuration defining all data sources
 * @returns Normalized protocol card data ready for UI consumption
 * @throws Error if required data cannot be fetched
 */
export async function fetchProtocolData(
  config: ProtocolConfig
): Promise<ProtocolCardData> {
  try {
    // Fetch Ethos data (identity layer)
    const ethosData = await getEthosData(config.ethos.searchName)

    // Fetch stock metric from configured source
    const stockValue = await fetchMetricValue(
      config.metrics.stock.source,
      config.metrics.stock.field,
      config.defillama.protocolSlug,
      config.defillama.category
    )

    // Fetch flow metric from configured source
    const flowValue = await fetchMetricValue(
      config.metrics.flow.source,
      config.metrics.flow.field,
      config.defillama.protocolSlug,
      config.defillama.category
    )

    // Return normalized data contract
    return {
      name: config.displayName,
      avatarUrl: ethosData.avatarUrl,
      ethosScore: ethosData.score,
      stockMetric: {
        label: config.metrics.stock.label,
        valueUsd: stockValue,
      },
      flowMetric: {
        label: config.metrics.flow.label,
        valueUsd: flowValue,
      },
    }
  } catch (error) {
    console.error(`Error fetching data for ${config.displayName}:`, error)
    throw error
  }
}

/**
 * Fetch protocol data with error handling suitable for UI rendering
 *
 * Returns either the data or null with error logged.
 * UI can decide how to render error states.
 *
 * @param config - Protocol configuration
 * @returns Protocol data or null if fetch failed
 */
export async function fetchProtocolDataSafe(
  config: ProtocolConfig
): Promise<ProtocolCardData | null> {
  try {
    return await fetchProtocolData(config)
  } catch (error) {
    console.error(`Failed to fetch protocol data for ${config.displayName}:`, error)
    return null
  }
}
