/**
 * Debug API endpoint to check which chains have/don't have Twitter handles
 */

import { NextResponse } from 'next/server'
import { fetchFilteredChains } from '@/lib/dynamic-chain-data'
import { getUserScoreFromTwitter } from '@/lib/api/ethos'

export const dynamic = 'force-dynamic'

interface ChainDebugInfo {
  name: string
  hasTwitterHandle: boolean
  twitterHandle: string | null
  hasEthosScore: boolean
  ethosScore: number
  stablecoinMCap: number
}

export async function GET() {
  try {
    console.log('='.repeat(80))
    console.log('CHAIN TWITTER HANDLE DEBUG REPORT')
    console.log('='.repeat(80))

    const chains = await fetchFilteredChains(5_000_000)

    const debugInfo: ChainDebugInfo[] = []

    for (const chain of chains) {
      const hasTwitterHandle = !!chain.twitter
      let hasEthosScore = false
      let ethosScore = 0

      if (hasTwitterHandle && chain.twitter) {
        const ethosData = await getUserScoreFromTwitter(chain.twitter)
        if (ethosData) {
          hasEthosScore = true
          ethosScore = ethosData.score
        }
      }

      debugInfo.push({
        name: chain.name,
        hasTwitterHandle,
        twitterHandle: chain.twitter,
        hasEthosScore,
        ethosScore,
        stablecoinMCap: chain.stablecoinMCap
      })
    }

    // Sort by stablecoin MCap descending
    debugInfo.sort((a, b) => b.stablecoinMCap - a.stablecoinMCap)

    // Calculate statistics
    const totalChains = debugInfo.length
    const chainsWithTwitter = debugInfo.filter(c => c.hasTwitterHandle).length
    const chainsWithEthosScore = debugInfo.filter(c => c.hasEthosScore).length
    const chainsWithoutTwitter = debugInfo.filter(c => !c.hasTwitterHandle)
    const chainsWithTwitterButNoEthos = debugInfo.filter(c => c.hasTwitterHandle && !c.hasEthosScore)

    const report = {
      summary: {
        totalChains,
        chainsWithTwitter,
        chainsWithEthosScore,
        chainsWithoutTwitter: chainsWithoutTwitter.length,
        chainsWithTwitterButNoEthos: chainsWithTwitterButNoEthos.length,
        twitterCoverage: `${((chainsWithTwitter / totalChains) * 100).toFixed(1)}%`,
        ethosCoverage: `${((chainsWithEthosScore / totalChains) * 100).toFixed(1)}%`
      },
      chainsWithoutTwitterHandle: chainsWithoutTwitter.map(c => ({
        name: c.name,
        stablecoinMCap: `$${(c.stablecoinMCap / 1e9).toFixed(2)}B`
      })),
      chainsWithTwitterButNoEthos: chainsWithTwitterButNoEthos.map(c => ({
        name: c.name,
        twitterHandle: c.twitterHandle,
        stablecoinMCap: `$${(c.stablecoinMCap / 1e9).toFixed(2)}B`
      })),
      allChains: debugInfo.map(c => ({
        name: c.name,
        twitter: c.twitterHandle || '❌ MISSING',
        ethosScore: c.hasEthosScore ? c.ethosScore : '❌ NOT FOUND',
        stablecoinMCap: `$${(c.stablecoinMCap / 1e6).toFixed(1)}M`
      }))
    }

    // Console logging
    console.log('\n📊 SUMMARY')
    console.log('─'.repeat(80))
    console.log(`Total chains (MCap >= $5M):        ${totalChains}`)
    console.log(`Chains WITH Twitter handle:        ${chainsWithTwitter} (${report.summary.twitterCoverage})`)
    console.log(`Chains WITH Ethos score:           ${chainsWithEthosScore} (${report.summary.ethosCoverage})`)
    console.log(`Chains WITHOUT Twitter handle:     ${chainsWithoutTwitter.length}`)
    console.log(`Chains with Twitter but NO Ethos:  ${chainsWithTwitterButNoEthos.length}`)

    console.log('\n❌ CHAINS WITHOUT TWITTER HANDLES:')
    console.log('─'.repeat(80))
    chainsWithoutTwitter.forEach((c, i) => {
      console.log(`${(i + 1).toString().padStart(3)}. ${c.name.padEnd(30)} | MCap: $${(c.stablecoinMCap / 1e9).toFixed(2)}B`)
    })

    console.log('\n⚠️  CHAINS WITH TWITTER BUT NO ETHOS SCORE:')
    console.log('─'.repeat(80))
    chainsWithTwitterButNoEthos.forEach((c, i) => {
      console.log(`${(i + 1).toString().padStart(3)}. ${c.name.padEnd(30)} | @${c.twitterHandle?.padEnd(20)} | MCap: $${(c.stablecoinMCap / 1e9).toFixed(2)}B`)
    })

    console.log('\n' + '='.repeat(80))

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to generate debug report' },
      { status: 500 }
    )
  }
}
