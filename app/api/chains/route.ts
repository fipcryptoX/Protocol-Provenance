/**
 * API Route: /api/chains
 *
 * Fetches all chain cards with Stablecoin MCap >= threshold
 * Acts as a proxy to DefiLlama + Ethos APIs
 * Implements reasonable caching to manage rate limits
 */

import { NextResponse } from 'next/server'
import { buildAllChainCards } from '@/lib/dynamic-chain-data'

// Cache for 5 minutes (reasonable caching to manage rate limits)
export const revalidate = 300

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const minMCap = searchParams.get('minMCap')
      ? parseFloat(searchParams.get('minMCap')!)
      : 5_000_000_000 // Default: $5B

    console.log(`[API] Fetching chains with Stablecoin MCap >= $${minMCap / 1_000_000_000}B`)

    const chainCards = await buildAllChainCards(minMCap)

    console.log(`[API] Successfully fetched ${chainCards.length} chain cards`)

    // Log chains that might have missing data
    const missingEthosScores = chainCards.filter((card) => card.ethosScore === 0)
    if (missingEthosScores.length > 0) {
      console.warn(
        `[API] ${missingEthosScores.length} chains have missing Ethos scores:`,
        missingEthosScores.map((c) => c.name).join(', ')
      )
    }

    return NextResponse.json({
      success: true,
      data: chainCards,
      count: chainCards.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API] Error fetching chains:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chain data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
