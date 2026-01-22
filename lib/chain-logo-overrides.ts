/**
 * Chain Logo System
 *
 * Uses DefiLlama CDN logos for all chains.
 * DefiLlama provides publicly accessible chain icons without CORS restrictions.
 */

/**
 * Chain logo URLs from DefiLlama icons CDN
 * Format: https://icons.llama.fi/{chainname}.jpg
 */
export const CHAIN_LOGO_OVERRIDES: Record<string, string> = {
  // No overrides needed - using auto-generated DefiLlama URLs
  // This object is kept for future manual overrides if needed
}

/**
 * Get the logo URL for a chain
 * Uses DefiLlama CDN format: https://icons.llama.fi/{chainname}.jpg
 */
export function getCorrectChainLogo(chainName: string, fallbackLogo: string | null): string | null {
  const normalizedName = chainName.toLowerCase().replace(/\s+/g, '')

  // Check if there's a manual override
  if (CHAIN_LOGO_OVERRIDES[normalizedName]) {
    return CHAIN_LOGO_OVERRIDES[normalizedName]
  }

  // If DefiLlama provided a logo, use it
  if (fallbackLogo) {
    return fallbackLogo
  }

  // Auto-generate logo URL from DefiLlama CDN
  // Format: https://icons.llama.fi/{chainname}.jpg
  return `https://icons.llama.fi/${normalizedName}.jpg`
}
