/**
 * Hyperliquid API Integration
 *
 * Hyperliquid provides its own API for perpetuals data including:
 * - Open Interest
 * - 24h Volume
 * - Mark prices and funding rates
 *
 * No API keys required
 */

const HYPERLIQUID_API_BASE = "https://api.hyperliquid.xyz"

export interface HyperliquidAssetContext {
  coin: string
  markPx: string
  openInterest: string
  funding: string
  dayNtlVlm: string // 24h notional volume
  premium: string
  oraclePx: string
}

export interface HyperliquidMetaAndAssetCtxs {
  universe: Array<{
    name: string
    szDecimals: number
  }>
  assetCtxs: HyperliquidAssetContext[]
}

/**
 * Get meta and asset contexts for all Hyperliquid perpetuals
 *
 * @returns Meta and asset contexts including open interest and volume
 */
export async function getHyperliquidMetaAndAssetCtxs(): Promise<HyperliquidMetaAndAssetCtxs> {
  try {
    const response = await fetch(`${HYPERLIQUID_API_BASE}/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "metaAndAssetCtxs",
      }),
      next: { revalidate: 120 }, // 2 minute cache as per PRD
    })

    if (!response.ok) {
      throw new Error(
        `Hyperliquid API returned ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching Hyperliquid meta and asset contexts:`, error)
    throw error
  }
}

/**
 * Get total open interest across all Hyperliquid perpetuals (in USD)
 *
 * @returns Total open interest in USD
 */
export async function getHyperliquidTotalOpenInterest(): Promise<number> {
  try {
    const data = await getHyperliquidMetaAndAssetCtxs()

    // Sum up open interest across all assets
    const totalOpenInterest = data.assetCtxs.reduce((total, asset) => {
      const oi = parseFloat(asset.openInterest) || 0
      return total + oi
    }, 0)

    return totalOpenInterest
  } catch (error) {
    console.error(`Error calculating Hyperliquid total open interest:`, error)
    throw error
  }
}

/**
 * Get total 24h volume across all Hyperliquid perpetuals (in USD)
 *
 * @returns Total 24h volume in USD
 */
export async function getHyperliquid24hVolume(): Promise<number> {
  try {
    const data = await getHyperliquidMetaAndAssetCtxs()

    // Sum up 24h volume across all assets
    const total24hVolume = data.assetCtxs.reduce((total, asset) => {
      const volume = parseFloat(asset.dayNtlVlm) || 0
      return total + volume
    }, 0)

    return total24hVolume
  } catch (error) {
    console.error(`Error calculating Hyperliquid 24h volume:`, error)
    throw error
  }
}
