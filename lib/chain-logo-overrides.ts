/**
 * Chain Logo System
 *
 * Uses CoinGecko high-resolution logos fetched via gecko_id.
 * The enrichment flow in dynamic-chain-data.ts fetches logos from CoinGecko's coins API.
 * This file provides manual overrides for special cases only.
 */

/**
 * Manual logo URL overrides for chains
 * Only use this for chains that need special handling
 */
export const CHAIN_LOGO_OVERRIDES: Record<string, string> = {
  // Add manual overrides here only if needed
  // Most chains will use logos automatically fetched from CoinGecko
}

/**
 * Get the logo URL for a chain
 * Applies manual overrides if configured, otherwise returns the provided logo
 */
export function getCorrectChainLogo(chainName: string, fallbackLogo: string | null): string | null {
  const normalizedName = chainName.toLowerCase().replace(/\s+/g, '')

  // Check if there's a manual override
  if (CHAIN_LOGO_OVERRIDES[normalizedName]) {
    return CHAIN_LOGO_OVERRIDES[normalizedName]
  }

  // Return the logo provided (from CoinGecko or DeFiLlama)
  return fallbackLogo
}
