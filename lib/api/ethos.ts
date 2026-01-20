/**
 * Ethos API Integration
 *
 * Ethos provides social credibility data for protocols:
 * - Canonical protocol identity
 * - Profile image/avatar
 * - Reputation score
 *
 * No API keys required, read-only endpoints
 */

const ETHOS_API_BASE = "https://api.ethos.network/v1"

export interface EthosProtocolData {
  name: string
  avatarUrl?: string
  score: number
}

/**
 * Get Ethos data for a protocol by search name
 *
 * @param searchName - The protocol name to search for
 * @returns Ethos protocol data including name, avatar, and score
 */
export async function getEthosData(
  searchName: string
): Promise<EthosProtocolData> {
  try {
    // Ethos API v2 endpoint - search by name/target
    // Note: The exact endpoint for protocol/target search is not documented publicly
    // Using a fallback approach with reasonable defaults
    const response = await fetch(
      `https://api.ethos.network/api/v2/users/search?query=${encodeURIComponent(searchName)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 120 }, // 2 minute cache as per PRD
      }
    )

    if (!response.ok) {
      console.warn(`Failed to fetch Ethos data for ${searchName}: ${response.status}`)
      throw new Error(`Ethos API returned ${response.status}`)
    }

    const data = await response.json()

    // Extract the first result
    const result = Array.isArray(data) ? data[0] : data?.results?.[0] || data

    if (!result) {
      throw new Error(`No Ethos data found for ${searchName}`)
    }

    return {
      name: result.name || result.displayName || searchName,
      avatarUrl: result.avatar || result.image || result.profileImage || result.avatarUrl || undefined,
      score: result.score || result.credibilityScore || result.ethosScore || 0,
    }
  } catch (error) {
    console.error(`Error fetching Ethos data for ${searchName}:`, error)
    // Return fallback data when API fails
    // TODO: Update this once the correct Ethos endpoint is confirmed
    return {
      name: searchName,
      avatarUrl: undefined,
      score: 0,
    }
  }
}
