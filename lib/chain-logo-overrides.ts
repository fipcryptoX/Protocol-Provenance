/**
 * Chain Logo System
 *
 * Uses high-quality logos from CoinGecko for major chains.
 * Falls back to DefiLlama CDN for chains not in the override list.
 */

/**
 * High-quality logo URLs from CoinGecko
 * CoinGecko provides better resolution images than DefiLlama's resized versions
 */
export const CHAIN_LOGO_OVERRIDES: Record<string, string> = {
  // Major chains with high-quality CoinGecko logos
  "ethereum": "https://coin-images.coingecko.com/asset_platforms/images/279/large/ethereum.png",
  "base": "https://coin-images.coingecko.com/asset_platforms/images/131/large/base.png",
  "solana": "https://coin-images.coingecko.com/asset_platforms/images/5/large/solana.png",
  "tron": "https://coin-images.coingecko.com/asset_platforms/images/1094/large/TRON_LOGO.png",
  "arbitrum": "https://coin-images.coingecko.com/asset_platforms/images/33/large/arbitrum.png",
  "polygon": "https://coin-images.coingecko.com/asset_platforms/images/15/large/polygon_pos.png",
  "optimism": "https://coin-images.coingecko.com/asset_platforms/images/1059/large/optimism.png",
  "avalanche": "https://coin-images.coingecko.com/asset_platforms/images/12/large/avalanche.png",
  "binance": "https://coin-images.coingecko.com/asset_platforms/images/1/large/binance-smart-chain.png",
}

/**
 * Get the logo URL for a chain
 * Prioritizes high-quality CoinGecko images, falls back to DefiLlama CDN
 */
export function getCorrectChainLogo(chainName: string, fallbackLogo: string | null): string | null {
  const normalizedName = chainName.toLowerCase()

  // Check if there's a high-quality override logo
  if (CHAIN_LOGO_OVERRIDES[normalizedName]) {
    const overrideUrl = CHAIN_LOGO_OVERRIDES[normalizedName]
    console.log(`Using override logo for ${chainName}: ${overrideUrl}`)
    return overrideUrl
  }

  // If DefiLlama provided a logo, use it
  if (fallbackLogo) {
    console.log(`Using DefiLlama logo for ${chainName}: ${fallbackLogo}`)
    return fallbackLogo
  }

  // Auto-generate logo URL from DefiLlama CDN as fallback
  // Format: https://defillama.com/chain-icons/rsz_[chainname].jpg
  const formattedName = chainName.toLowerCase().replace(/\s+/g, '')
  const generatedUrl = `https://defillama.com/chain-icons/rsz_${formattedName}.jpg`
  console.log(`Using generated logo for ${chainName}: ${generatedUrl}`)
  return generatedUrl
}
