/**
 * API Route: /api/protocol/history
 *
 * Fetches 30-day historical data for sparklines
 * Used for lazy-loading sparklines as cards scroll into view
 */

import { NextResponse } from 'next/server'

const DEFILLAMA_API_BASE = 'https://api.llama.fi'

// Cache for 5 minutes
export const revalidate = 300

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const metric = searchParams.get('metric') || 'tvl' // tvl, volume, revenue, etc.

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Protocol slug is required' },
        { status: 400 }
      )
    }

    console.log(`[API] Fetching historical ${metric} data for ${slug}`)

    // Fetch protocol details with historical data
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocol/${slug}`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.warn(`[API] Protocol ${slug} not found: ${response.status}`)
      return NextResponse.json(
        { success: false, error: 'Protocol not found' },
        { status: 404 }
      )
    }

    const protocolData = await response.json()

    // Extract historical TVL data
    let historicalData: Array<{ date: number; value: number }> = []

    if (metric === 'tvl' && protocolData.chainTvls) {
      // Extract TVL data from chainTvls
      const tvlData = protocolData.chainTvls?.tvl || []
      historicalData = tvlData.map((point: { date: number; totalLiquidityUSD: number }) => ({
        date: point.date,
        value: point.totalLiquidityUSD || 0,
      }))
    } else if (protocolData.tvl && Array.isArray(protocolData.tvl)) {
      // Some protocols have tvl as a direct array
      historicalData = protocolData.tvl.map((point: any) => ({
        date: point.date,
        value: point.totalLiquidityUSD || point.tvl || 0,
      }))
    }

    // Filter to last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
    const last30Days = historicalData
      .filter((point) => point.date >= thirtyDaysAgo)
      .sort((a, b) => a.date - b.date)

    console.log(`[API] Fetched ${last30Days.length} historical data points for ${slug}`)

    return NextResponse.json({
      success: true,
      data: last30Days,
      protocol: slug,
      metric,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API] Error fetching historical data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch historical data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
