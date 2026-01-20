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
const ETHOS_API_V2_BASE = "https://api.ethos.network/api/v2"

export interface EthosProtocolData {
  name: string
  avatarUrl?: string
  score: number
}

export interface EthosUserScore {
  score: number
  level: string
}

export interface EthosUser {
  id: number
  username?: string
  // Add other fields as needed
}

/**
 * Get Ethos data for a protocol by search name
 *
 * @deprecated This uses the deprecated v1 API. Use getUserScoreFromTwitter instead with v2 API.
 * @param searchName - The protocol name to search for
 * @returns Ethos protocol data including name, avatar, and score
 */
export async function getEthosData(
  searchName: string
): Promise<EthosProtocolData> {
  try {
    // Search for the protocol
    const response = await fetch(
      `${ETHOS_API_BASE}/search?query=${encodeURIComponent(searchName)}&type=target`,
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

    // Extract the first result (assuming search returns array)
    const result = Array.isArray(data) ? data[0] : data

    if (!result) {
      throw new Error(`No Ethos data found for ${searchName}`)
    }

    return {
      name: result.name || searchName,
      avatarUrl: result.avatar || result.image || result.profileImage || undefined,
      score: result.score || result.ethosScore || 0,
    }
  } catch (error) {
    console.error(`Error fetching Ethos data for ${searchName}:`, error)
    // Return fallback data when API fails
    return {
      name: searchName,
      avatarUrl: undefined,
      score: 0,
    }
  }
}

/**
 * Get user ID from Twitter username
 *
 * @param twitterUsername - The Twitter username (without @)
 * @returns User ID
 */
export async function getUserIdFromTwitterUsername(
  twitterUsername: string
): Promise<number | null> {
  try {
    const response = await fetch(`${ETHOS_API_V2_BASE}/users/by/x`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({
        accountIdsOrUsernames: [twitterUsername],
      }),
      next: { revalidate: 120 }, // 2 minute cache
    })

    if (!response.ok) {
      console.warn(
        `Failed to fetch user ID for ${twitterUsername}: ${response.status}`
      )
      return null
    }

    const data = await response.json()

    // The API returns an array of users
    if (Array.isArray(data) && data.length > 0) {
      return data[0].id || null
    }

    return null
  } catch (error) {
    console.error(`Error fetching user ID for ${twitterUsername}:`, error)
    return null
  }
}

/**
 * Get user score by user ID
 *
 * @param userId - The Ethos user ID
 * @returns User score and level
 */
export async function getUserScoreByUserId(
  userId: number
): Promise<EthosUserScore | null> {
  try {
    const response = await fetch(
      `${ETHOS_API_V2_BASE}/score/userId?userId=${userId}`,
      {
        headers: {
          Accept: "*/*",
        },
        next: { revalidate: 120 }, // 2 minute cache
      }
    )

    if (!response.ok) {
      console.warn(`Failed to fetch score for user ID ${userId}: ${response.status}`)
      return null
    }

    const data = await response.json()

    return {
      score: data.score || 0,
      level: data.level || "unknown",
    }
  } catch (error) {
    console.error(`Error fetching score for user ID ${userId}:`, error)
    return null
  }
}

/**
 * Get user score from Twitter username (combines the two API calls)
 *
 * @param twitterUsername - The Twitter username (without @)
 * @returns User score and level
 */
export async function getUserScoreFromTwitter(
  twitterUsername: string
): Promise<EthosUserScore | null> {
  try {
    // First, get the user ID
    const userId = await getUserIdFromTwitterUsername(twitterUsername)

    if (!userId) {
      console.warn(`No user ID found for Twitter username: ${twitterUsername}`)
      return null
    }

    // Then, get the score using the user ID
    const userScore = await getUserScoreByUserId(userId)

    return userScore
  } catch (error) {
    console.error(
      `Error fetching user score for Twitter username ${twitterUsername}:`,
      error
    )
    return null
  }
}
