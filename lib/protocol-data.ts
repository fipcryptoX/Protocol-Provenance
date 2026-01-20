/**
 * Protocol Data Normalization Layer
 *
 * This module is responsible for:
 * 1. Fetching data from Ethos and DefiLlama based on protocol configuration
 * 2. Normalizing the data into the ProtocolCardData contract
 * 3. Handling errors and providing explicit error states
 *
 * The UI must not know about API sources, protocol categories, or fetching logic.
 * All protocol-specific decisions are driven by configuration.
 */

import { ProtocolConfig } from "@/lib/protocol-config"
import { getEthosData, EthosProtocolData, getUserScoreFromTwitter } from "@/lib/api/ethos"
import { getMetricFromCategory } from "@/lib/api/defillama"
import { AssetCardProps } from "@/components/ui/asset-card"

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
 * Fetch and normalize protocol data based on configuration
 *
 * This function:
 * - Fetches Ethos identity data (name, avatar, score)
 * - Fetches DefiLlama metrics based on category and field configuration
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

    // If Twitter username is configured, fetch user score from Twitter
    let finalEthosScore = ethosData.score
    if (config.ethos.twitterUsername) {
      const twitterScore = await getUserScoreFromTwitter(config.ethos.twitterUsername)
      if (twitterScore) {
        finalEthosScore = twitterScore.score
        console.log(
          `Using Twitter score for ${config.displayName}: ${twitterScore.score} (${twitterScore.level})`
        )
      } else {
        console.warn(
          `Failed to fetch Twitter score for ${config.ethos.twitterUsername}, falling back to search score`
        )
      }
    }

    // Fetch stock metric from DefiLlama
    const stockValue = await getMetricFromCategory(
      config.defillama.protocolSlug,
      config.defillama.category,
      config.metrics.stock.field
    )

    if (stockValue === null) {
      throw new Error(
        `Failed to fetch stock metric (${config.metrics.stock.field}) for ${config.displayName}`
      )
    }

    // Fetch flow metric from DefiLlama
    const flowValue = await getMetricFromCategory(
      config.defillama.protocolSlug,
      config.defillama.category,
      config.metrics.flow.field
    )

    if (flowValue === null) {
      throw new Error(
        `Failed to fetch flow metric (${config.metrics.flow.field}) for ${config.displayName}`
      )
    }

    // Return normalized data contract
    return {
      name: config.displayName,
      avatarUrl: ethosData.avatarUrl,
      ethosScore: finalEthosScore,
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
