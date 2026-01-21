/**
 * Ethos Score Ranking System
 *
 * Maps Ethos scores to ranks and colors according to the PRD specification.
 */

export interface EthosRank {
  rank: string
  color: string
  minScore: number
  maxScore: number
}

/**
 * Ethos score ranking table
 */
export const ETHOS_RANKS: EthosRank[] = [
  { rank: "Untrusted", color: "#B91C1C", minScore: 0, maxScore: 799 },
  { rank: "Questionable", color: "#D4A017", minScore: 800, maxScore: 1199 },
  { rank: "Neutral", color: "#D1D5DB", minScore: 1200, maxScore: 1399 },
  { rank: "Known", color: "#94A3B8", minScore: 1400, maxScore: 1599 },
  { rank: "Established", color: "#4F83BD", minScore: 1600, maxScore: 1799 },
  { rank: "Reputable", color: "#2F7DD1", minScore: 1800, maxScore: 1999 },
  { rank: "Exemplary", color: "#4B7F52", minScore: 2000, maxScore: 2199 },
  { rank: "Distinguished", color: "#1E7F3B", minScore: 2200, maxScore: 2399 },
  { rank: "Revered", color: "#8B79B7", minScore: 2400, maxScore: 2599 },
  { rank: "Renowned", color: "#7A5EA6", minScore: 2600, maxScore: 2800 },
]

/**
 * Get rank and color for an Ethos score
 */
export function getEthosRank(score: number): EthosRank {
  // Find the matching rank
  const rank = ETHOS_RANKS.find(
    (r) => score >= r.minScore && score <= r.maxScore
  )

  // If score is above max, return the highest rank
  if (!rank) {
    return ETHOS_RANKS[ETHOS_RANKS.length - 1]
  }

  return rank
}

/**
 * Get color for an Ethos score
 */
export function getEthosColor(score: number): string {
  return getEthosRank(score).color
}

/**
 * Get rank name for an Ethos score
 */
export function getEthosRankName(score: number): string {
  return getEthosRank(score).rank
}
