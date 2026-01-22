/**
 * Ethos API Client-Side Functions
 *
 * Client-safe versions of Ethos API functions that don't use Next.js server-specific
 * fetch options like `next: { revalidate }`. These are used in client components
 * like infinite-scroll-cards.tsx.
 */

const ETHOS_API_V2_BASE = "https://api.ethos.network/api/v2"

export interface EthosUserScore {
  score: number
  level: string
}

export type ReviewSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE"

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
 * Get user ID from Twitter username (client-side)
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
      cache: "no-store" // Client-side: don't cache
    })

    if (!response.ok) {
      console.warn(
        `[Ethos Client] Failed to fetch user ID for ${twitterUsername}: ${response.status}`
      )
      return null
    }

    const data = await response.json()

    if (Array.isArray(data) && data.length > 0) {
      return data[0].id || null
    }

    return null
  } catch (error) {
    console.error(`[Ethos Client] Error fetching user ID for ${twitterUsername}:`, error)
    return null
  }
}

/**
 * Get user score by user ID (client-side)
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
        cache: "no-store" // Client-side: don't cache
      }
    )

    if (!response.ok) {
      console.warn(`[Ethos Client] Failed to fetch score for user ID ${userId}: ${response.status}`)
      return null
    }

    const data = await response.json()

    return {
      score: data.score || 0,
      level: data.level || "unknown",
    }
  } catch (error) {
    console.error(`[Ethos Client] Error fetching score for user ID ${userId}:`, error)
    return null
  }
}

/**
 * Get user score from Twitter username (client-side)
 */
export async function getUserScoreFromTwitter(
  twitterUsername: string
): Promise<EthosUserScore | null> {
  try {
    console.log(`[Ethos Client] Fetching user score for @${twitterUsername}`)

    // First, get the user ID
    const userId = await getUserIdFromTwitterUsername(twitterUsername)

    if (!userId) {
      console.warn(`[Ethos Client] No user ID found for Twitter username: ${twitterUsername}`)
      return null
    }

    console.log(`[Ethos Client] Found user ID ${userId} for @${twitterUsername}`)

    // Then, get the score using the user ID
    const userScore = await getUserScoreByUserId(userId)

    if (userScore) {
      console.log(`[Ethos Client] Score for @${twitterUsername}: ${userScore.score}`)
    }

    return userScore
  } catch (error) {
    console.error(
      `[Ethos Client] Error fetching user score for Twitter username ${twitterUsername}:`,
      error
    )
    return null
  }
}

/**
 * Get Ethos user by Twitter username (client-side)
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
        cache: "no-store" // Client-side: don't cache
      }
    )

    if (!response.ok) {
      console.warn(
        `[Ethos Client] Failed to fetch Ethos user for Twitter @${twitterUsername}: ${response.status}`
      )
      return null
    }

    const data: EthosUserByTwitterResponse = await response.json()

    if (!data.userkeys || data.userkeys.length === 0) {
      console.warn(`[Ethos Client] No userkeys found for Twitter @${twitterUsername}`)
      return null
    }

    console.log(
      `[Ethos Client] Found Ethos user for @${twitterUsername}: ${data.userkeys[0]}, score: ${data.score}`
    )

    return data
  } catch (error) {
    console.error(`[Ethos Client] Error fetching Ethos user for @${twitterUsername}:`, error)
    return null
  }
}

/**
 * Get reviews for a user by their Twitter username (client-side)
 */
export async function getReviewsByTwitter(
  twitterUsername: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ reviews: EthosReview[]; total: number }> {
  try {
    console.log(`[Ethos Client] Fetching reviews for @${twitterUsername}`)

    // First, get the user's userkey
    const user = await getUserByTwitter(twitterUsername)

    if (!user || !user.userkeys || user.userkeys.length === 0) {
      console.warn(`[Ethos Client] Cannot fetch reviews: no userkey for @${twitterUsername}`)
      return { reviews: [], total: 0 }
    }

    // Use the first userkey to fetch reviews
    const userkey = user.userkeys[0]
    console.log(`[Ethos Client] Using userkey: ${userkey} for @${twitterUsername}`)

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
        cache: "no-store" // Client-side: don't cache
      }
    )

    if (!response.ok) {
      console.warn(
        `[Ethos Client] Failed to fetch reviews for @${twitterUsername}: ${response.status}`
      )
      return { reviews: [], total: 0 }
    }

    const data: EthosActivitiesResponse = await response.json()

    console.log(
      `[Ethos Client] Raw API response for @${twitterUsername}: ${data.values.length} activities, ${data.total} total`
    )

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

    console.log(
      `[Ethos Client] Fetched ${reviews.length} reviews for @${twitterUsername}`
    )

    return {
      reviews,
      total: data.total,
    }
  } catch (error) {
    console.error(`[Ethos Client] Error fetching reviews for @${twitterUsername}:`, error)
    return { reviews: [], total: 0 }
  }
}
