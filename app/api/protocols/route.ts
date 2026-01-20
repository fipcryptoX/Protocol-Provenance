/**
 * API Route: /api/protocols
 *
 * Fetches all protocol cards with TVL >= threshold
 * Acts as a proxy to DefiLlama + Ethos APIs
 * Implements reasonable caching to manage rate limits
 */

import { NextResponse } from 'next/server'
import { buildAllProtocolCards } from '@/lib/dynamic-protocol-data'

// Cache for 5 minutes (reasonable caching to manage rate limits)
export const revalidate = 300

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const minTVL = searchParams.get('minTVL')
      ? parseFloat(searchParams.get('minTVL')!)
      : 10_000_000_000 // Default: $10B

    console.log(`[API] Fetching protocols with TVL >= $${minTVL / 1_000_000_000}B`)

    const protocolCards = await buildAllProtocolCards(minTVL)

    console.log(`[API] Successfully fetched ${protocolCards.length} protocol cards`)

    // Log protocols that might have missing data
    const missingEthosScores = protocolCards.filter((card) => card.ethosScore === 0)
    if (missingEthosScores.length > 0) {
      console.warn(
        `[API] ${missingEthosScores.length} protocols have missing Ethos scores:`,
        missingEthosScores.map((c) => c.name).join(', ')
      )
    }

    return NextResponse.json({
      success: true,
      data: protocolCards,
      count: protocolCards.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API] Error fetching protocols:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch protocol data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
