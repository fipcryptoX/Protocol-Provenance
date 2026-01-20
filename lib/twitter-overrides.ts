/**
 * Twitter Handle Overrides
 *
 * Manual overrides for protocols where DefiLlama has outdated or incorrect Twitter handles.
 * Maps protocol name (lowercase) to the correct Twitter username.
 */

export const TWITTER_OVERRIDES: Record<string, string> = {
  // Protocol overrides
  "eigencloud": "eigencloud",
  "eigenlayer": "eigencloud",

  // Chain overrides
  "ethereum": "ethereum",
  "base": "base",
  "arbitrum": "arbitrum",
  "solana": "solana",
  "bitcoin": "bitcoin",
  "tron": "trondao",
  "plasma": "PlasmaNetwork_",
  "binance": "binance",
}

/**
 * Get the correct Twitter handle for a protocol
 * Checks overrides first, then falls back to the provided handle
 */
export function getCorrectTwitterHandle(protocolName: string, fallbackHandle: string | null): string | null {
  const normalizedName = protocolName.toLowerCase()

  // Check if there's an override
  if (TWITTER_OVERRIDES[normalizedName]) {
    return TWITTER_OVERRIDES[normalizedName]
  }

  // Also check if the fallback handle itself has an override
  if (fallbackHandle && TWITTER_OVERRIDES[fallbackHandle.toLowerCase()]) {
    return TWITTER_OVERRIDES[fallbackHandle.toLowerCase()]
  }

  return fallbackHandle
}
