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
    timestamp: number
    data?: {
      id?: number
      comment?: string
      metadata?: string
      score?: string
    }
    author?: {
      profileId?: number
      name?: string
      username?: string
      avatar?: string
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
      .filter((activity) => {
        const isReview = activity.type === "review"
        const hasContent = !!(activity.data?.comment || activity.data?.metadata)
        return isReview && hasContent
      })
      .map((activity) => {
        // Extract content from data.comment and/or data.metadata.description
        let content = activity.data?.comment || ""

        // Try to parse metadata for full description
        if (activity.data?.metadata) {
          try {
            const metadata = JSON.parse(activity.data.metadata)
            if (metadata.description) {
              content = metadata.description
            }
          } catch (e) {
            // If metadata parsing fails, stick with comment
          }
        }

        // Map score field to reviewScore
        const scoreMap: Record<string, ReviewSentiment> = {
          positive: "POSITIVE",
          neutral: "NEUTRAL",
          negative: "NEGATIVE",
        }
        const reviewScore = scoreMap[activity.data?.score?.toLowerCase() || ""] || "NEUTRAL"

        return {
          id: activity.data?.id?.toString() || `${activity.timestamp}-${activity.author?.profileId}`,
          createdAt: new Date(activity.timestamp * 1000).toISOString(),
          content,
          reviewScore,
          author: {
            id: activity.author?.profileId || 0,
            displayName: activity.author?.name || activity.author?.username,
            username: activity.author?.username,
            avatarUrl: activity.author?.avatar,
            score: activity.author?.score || 0,
          },
        }
      })

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
 * Ethos user response from /user/by/x endpoint
 */
export interface EthosUserByTwitterResponse {
  userkeys: string[]
  id: number
  profileId: number
  username?: string
  displayName?: string
  avatarUrl?: string
  score: number
  status?: string
  [key: string]: any
}

/**
 * Get Ethos user by Twitter username
 *
 * @param twitterUsername - The Twitter/X username (without @)
 * @returns User data including userkeys array
 */
export async function getUserByTwitter(
  twitterUsername: string
): Promise<EthosUserByTwitterResponse | null> {
  try {
    const response = await fetch(
      `${ETHOS_API_V2_BASE}/user/by/x/${twitterUsername}`,
      {
        headers: {
          Accept: "*/*",
        },
        next: { revalidate: 300 }, // 5 minute cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch Ethos user for Twitter @${twitterUsername}: ${response.status}`
      )
      return null
    }

    const data: EthosUserByTwitterResponse = await response.json()

    if (!data.userkeys || data.userkeys.length === 0) {
      console.warn(`No userkeys found for Twitter @${twitterUsername}`)
      return null
    }

    console.log(
      `Found Ethos user for @${twitterUsername}: ${data.userkeys[0]}, score: ${data.score}`
    )

    return data
  } catch (error) {
    console.error(`Error fetching Ethos user for @${twitterUsername}:`, error)
    return null
  }
}

/**
 * Get reviews for a user by their Twitter username
 *
 * @param twitterUsername - The Twitter/X username (without @)
 * @param limit - Number of reviews to fetch (default: 100)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of reviews and pagination info
 */
export async function getReviewsByTwitter(
  twitterUsername: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ reviews: EthosReview[]; total: number }> {
  try {
    // First, get the user's userkey
    const user = await getUserByTwitter(twitterUsername)

    if (!user || !user.userkeys || user.userkeys.length === 0) {
      console.warn(`Cannot fetch reviews: no userkey for @${twitterUsername}`)
      return { reviews: [], total: 0 }
    }

    // Use the first userkey to fetch reviews
    const userkey = user.userkeys[0]
    console.log(`Using userkey: ${userkey} for @${twitterUsername}`)

    const requestBody = {
      userkey,
      filter: ["review"],
      limit,
      offset,
      excludeSpam: true,
    }
    console.log(`Fetching reviews with body:`, JSON.stringify(requestBody, null, 2))

    const response = await fetch(
      `${ETHOS_API_V2_BASE}/activities/profile/received`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(requestBody),
        next: { revalidate: 300 }, // 5 minute cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch reviews for @${twitterUsername}: ${response.status}`
      )
      return { reviews: [], total: 0 }
    }

    const data: EthosActivitiesResponse = await response.json()

    console.log(
      `Raw API response for @${twitterUsername}:`,
      `${data.values.length} activities, ${data.total} total`
    )
    console.log(`Activity types:`, data.values.map(v => v.type).join(', '))

    // Debug: Log the first review to see its structure
    const firstReview = data.values.find(v => v.type === 'review')
    if (firstReview) {
      console.log(`First review structure:`, JSON.stringify(firstReview, null, 2))
    }

    // Filter and transform review activities
    const reviews: EthosReview[] = data.values
      .filter((activity) => {
        const isReview = activity.type === "review"
        // Check for content in the correct fields: data.comment or data.metadata
        const hasContent = !!(activity.data?.comment || activity.data?.metadata)
        if (!isReview) console.log(`Skipping non-review activity: ${activity.type}`)
        if (isReview && !hasContent) console.log(`Skipping review without content`)
        return isReview && hasContent
      })
      .map((activity) => {
        // Extract content from data.comment and/or data.metadata.description
        let content = activity.data?.comment || ""

        // Try to parse metadata for full description
        if (activity.data?.metadata) {
          try {
            const metadata = JSON.parse(activity.data.metadata)
            if (metadata.description) {
              content = metadata.description
            }
          } catch (e) {
            // If metadata parsing fails, stick with comment
          }
        }

        // Map score field to reviewScore (positive/neutral/negative)
        const scoreMap: Record<string, ReviewSentiment> = {
          positive: "POSITIVE",
          neutral: "NEUTRAL",
          negative: "NEGATIVE",
        }
        const reviewScore = scoreMap[activity.data?.score?.toLowerCase() || ""] || "NEUTRAL"

        return {
          id: activity.data?.id?.toString() || `${activity.timestamp}-${activity.author?.profileId}`,
          createdAt: new Date(activity.timestamp * 1000).toISOString(),
          content,
          reviewScore,
          author: {
            id: activity.author?.profileId || 0,
            displayName: activity.author?.name || activity.author?.username,
            username: activity.author?.username,
            avatarUrl: activity.author?.avatar,
            score: activity.author?.score || 0,
          },
        }
      })

    console.log(
      `Fetched ${reviews.length} reviews for @${twitterUsername} (${data.total} total, ${data.values.length} activities returned)`
    )

    return {
      reviews,
      total: data.total,
    }
  } catch (error) {
    console.error(`Error fetching reviews for @${twitterUsername}:`, error)
    return { reviews: [], total: 0 }
  }
}

/**
 * Get ALL historical reviews for a user by their Twitter username
 * Automatically paginates through all results
 *
 * @param twitterUsername - The Twitter/X username (without @)
 * @param maxReviews - Maximum number of reviews to fetch (default: 500)
 * @returns Array of all reviews
 */
export async function getAllReviewsByTwitter(
  twitterUsername: string,
  maxReviews: number = 500
): Promise<EthosReview[]> {
  const allReviews: EthosReview[] = []
  let offset = 0
  const limit = 50
  let total = 0

  try {
    // Fetch userkey ONCE to avoid rate limiting
    const user = await getUserByTwitter(twitterUsername)

    if (!user || !user.userkeys || user.userkeys.length === 0) {
      console.warn(`Cannot fetch reviews: no userkey for @${twitterUsername}`)
      return []
    }

    const userkey = user.userkeys[0]
    console.log(`Using userkey: ${userkey} for @${twitterUsername}`)

    // Fetch first batch to get total count
    const firstBatch = await fetchReviewsWithUserkey(userkey, limit, offset, twitterUsername)
    allReviews.push(...firstBatch.reviews)
    total = firstBatch.total
    offset += limit

    // Continue fetching until we have all reviews or hit maxReviews
    while (offset < total && allReviews.length < maxReviews) {
      const batch = await fetchReviewsWithUserkey(userkey, limit, offset, twitterUsername)
      allReviews.push(...batch.reviews)
      offset += limit

      if (batch.reviews.length === 0) {
        break // No more reviews
      }
    }

    console.log(
      `Fetched ${allReviews.length} total reviews for @${twitterUsername}`
    )

    return allReviews
  } catch (error) {
    console.error(
      `Error fetching all reviews for @${twitterUsername}:`,
      error
    )
    return allReviews // Return what we have so far
  }
}

/**
 * Helper function to fetch reviews using a userkey directly
 * Avoids repeated userkey lookups
 */
async function fetchReviewsWithUserkey(
  userkey: string,
  limit: number,
  offset: number,
  twitterUsername: string
): Promise<{ reviews: EthosReview[]; total: number }> {
  try {
    const requestBody = {
      userkey,
      filter: ["review"],
      limit,
      offset,
      excludeSpam: true,
    }

    const response = await fetch(
      `${ETHOS_API_V2_BASE}/activities/profile/received`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(requestBody),
        next: { revalidate: 300 }, // 5 minute cache
      }
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch reviews for @${twitterUsername}: ${response.status}`
      )
      return { reviews: [], total: 0 }
    }

    const data: EthosActivitiesResponse = await response.json()

    // Filter and transform review activities
    const reviews: EthosReview[] = data.values
      .filter((activity) => {
        const isReview = activity.type === "review"
        const hasContent = !!(activity.data?.comment || activity.data?.metadata)
        return isReview && hasContent
      })
      .map((activity) => {
        // Extract content from data.comment and/or data.metadata.description
        let content = activity.data?.comment || ""

        // Try to parse metadata for full description
        if (activity.data?.metadata) {
          try {
            const metadata = JSON.parse(activity.data.metadata)
            if (metadata.description) {
              content = metadata.description
            }
          } catch (e) {
            // If metadata parsing fails, stick with comment
          }
        }

        // Map score field to reviewScore
        const scoreMap: Record<string, ReviewSentiment> = {
          positive: "POSITIVE",
          neutral: "NEUTRAL",
          negative: "NEGATIVE",
        }
        const reviewScore = scoreMap[activity.data?.score?.toLowerCase() || ""] || "NEUTRAL"

        return {
          id: activity.data?.id?.toString() || `${activity.timestamp}-${activity.author?.profileId}`,
          createdAt: new Date(activity.timestamp * 1000).toISOString(),
          content,
          reviewScore,
          author: {
            id: activity.author?.profileId || 0,
            displayName: activity.author?.name || activity.author?.username,
            username: activity.author?.username,
            avatarUrl: activity.author?.avatar,
            score: activity.author?.score || 0,
          },
        }
      })

    return {
      reviews,
      total: data.total,
    }
  } catch (error) {
    console.error(`Error fetching reviews for @${twitterUsername}:`, error)
    return { reviews: [], total: 0 }
  }
}
