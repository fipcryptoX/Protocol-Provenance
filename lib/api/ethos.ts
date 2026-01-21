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
  avatarUrl?: string
  displayName?: string
  score?: number
  // Add other fields as needed
}

export interface EthosProject {
  id: number
  userkey: string
  status: string
  description?: string
  user: EthosUser
  // Add other fields as needed
}

export interface EthosProjectsResponse {
  projects: EthosProject[]
  total: number
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

/**
 * Get avatar URL from Ethos projects API
 *
 * @param projectName - The project name to search for (e.g., "Hyperliquid")
 * @returns Avatar URL or null if not found
 */
export async function getProjectAvatarUrl(
  projectName: string
): Promise<string | null> {
  try {
    const response = await fetch(`${ETHOS_API_V2_BASE}/projects`, {
      headers: {
        Accept: "*/*",
      },
      next: { revalidate: 120 }, // 2 minute cache
    })

    if (!response.ok) {
      console.warn(
        `Failed to fetch projects from Ethos: ${response.status}`
      )
      return null
    }

    const data: EthosProjectsResponse = await response.json()

    console.log(`Searching for project: ${projectName} among ${data.projects.length} projects`)

    // Find the project by userkey or user display name
    const project = data.projects.find(
      (p) =>
        p.userkey?.toLowerCase() === projectName.toLowerCase() ||
        p.user?.displayName?.toLowerCase() === projectName.toLowerCase() ||
        p.user?.username?.toLowerCase() === projectName.toLowerCase()
    )

    if (!project) {
      console.warn(
        `Project ${projectName} not found in projects list`
      )
      // Log available project names for debugging
      console.log(
        `Available projects:`,
        data.projects.slice(0, 10).map(p => ({
          userkey: p.userkey,
          displayName: p.user?.displayName,
          username: p.user?.username
        }))
      )
      return null
    }

    if (!project.user?.avatarUrl) {
      console.warn(
        `No avatar URL found for project: ${projectName}`
      )
      return null
    }

    console.log(`Avatar URL found for ${projectName}: ${project.user.avatarUrl}`)
    return project.user.avatarUrl
  } catch (error) {
    console.error(
      `Error fetching avatar URL for ${projectName}:`,
      error
    )
    return null
  }
}

/**
 * Review sentiment types
 */
export type ReviewSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE"

/**
 * Review activity from Ethos
 */
export interface EthosReview {
  id: string
  createdAt: string
  content: string
  reviewScore: ReviewSentiment
  author: {
    id: number
    displayName?: string
    username?: string
    avatarUrl?: string
    score: number
  }
}

/**
 * Response from Ethos activities endpoint
 */
export interface EthosActivitiesResponse {
  values: Array<{
    type: string
    createdAt: string
    content?: string
    reviewScore?: ReviewSentiment
    author?: {
      id?: number
      displayName?: string
      username?: string
      avatarUrl?: string
      score?: number
    }
    [key: string]: any
  }>
  total: number
  limit: number
  offset: number
}

/**
 * Get reviews for a protocol/project by userkey
 *
 * @param userkey - The Ethos userkey for the protocol
 * @param limit - Number of reviews to fetch (default: 100)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of reviews and pagination info
 */
export async function getProtocolReviews(
  userkey: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ reviews: EthosReview[]; total: number }> {
  try {
    const response = await fetch(
      `${ETHOS_API_V2_BASE}/activities/profile/received`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          userkey,
          filter: ["review"],
          orderBy: {
            field: "timestamp",
            direction: "desc",
          },
          limit,
          offset,
          excludeSpam: true,
        }),
        next: { revalidate: 300 }, // 5 minute cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch reviews for ${userkey}: ${response.status}`
      )
      return { reviews: [], total: 0 }
    }

    const data: EthosActivitiesResponse = await response.json()

    // Filter and transform review activities
    const reviews: EthosReview[] = data.values
      .filter((activity) => activity.type === "review" && activity.content)
      .map((activity) => ({
        id: activity.id || `${activity.createdAt}-${activity.author?.id}`,
        createdAt: activity.createdAt,
        content: activity.content || "",
        reviewScore: activity.reviewScore || "NEUTRAL",
        author: {
          id: activity.author?.id || 0,
          displayName: activity.author?.displayName,
          username: activity.author?.username,
          avatarUrl: activity.author?.avatarUrl,
          score: activity.author?.score || 0,
        },
      }))

    return {
      reviews,
      total: data.total,
    }
  } catch (error) {
    console.error(`Error fetching reviews for ${userkey}:`, error)
    return { reviews: [], total: 0 }
  }
}

/**
 * Get userkey from project name
 *
 * @param projectName - The project name to search for
 * @returns Userkey or null if not found
 */
export async function getUserkeyFromProjectName(
  projectName: string
): Promise<string | null> {
  try {
    const response = await fetch(`${ETHOS_API_V2_BASE}/projects`, {
      headers: {
        Accept: "*/*",
      },
      next: { revalidate: 120 }, // 2 minute cache
    })

    if (!response.ok) {
      console.warn(
        `Failed to fetch projects from Ethos: ${response.status}`
      )
      return null
    }

    const data: EthosProjectsResponse = await response.json()

    // Find the project by userkey or user display name
    const project = data.projects.find(
      (p) =>
        p.userkey?.toLowerCase() === projectName.toLowerCase() ||
        p.user?.displayName?.toLowerCase() === projectName.toLowerCase() ||
        p.user?.username?.toLowerCase() === projectName.toLowerCase()
    )

    if (!project) {
      console.warn(`Project ${projectName} not found`)
      return null
    }

    return project.userkey
  } catch (error) {
    console.error(`Error fetching userkey for ${projectName}:`, error)
    return null
  }
}
