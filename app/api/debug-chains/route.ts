/**
 * Debug API endpoint to check which chains have/don't have Twitter handles
 */

import { NextResponse } from 'next/server'
import { fetchFilteredChains } from '@/lib/dynamic-chain-data'
import { getUserScoreFromTwitter } from '@/lib/api/ethos'
import { getCorrectTwitterHandle } from '@/lib/twitter-overrides'

export const dynamic = 'force-dynamic'

interface ChainDebugInfo {
  name: string
  hasTwitterHandle: boolean
  twitterHandle: string | null
  twitterSource: 'manual_override' | 'coingecko' | 'defillama' | 'none'
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
      const rawTwitter = chain.twitter
      const finalTwitter = getCorrectTwitterHandle(chain.name, rawTwitter)
      const hasTwitterHandle = !!finalTwitter
      let hasEthosScore = false
      let ethosScore = 0

      // Determine Twitter source
      let twitterSource: 'manual_override' | 'coingecko' | 'defillama' | 'none' = 'none'
      if (finalTwitter) {
        // Check if it's from manual override by seeing if it's different from raw
        const manualOverride = getCorrectTwitterHandle(chain.name, null)
        if (manualOverride === finalTwitter) {
          twitterSource = 'manual_override'
        } else if (rawTwitter === finalTwitter) {
          // Same as raw, so it came from the chain data (could be CoinGecko or DeFiLlama)
          // We can't distinguish here without more context, but based on our flow it's likely CoinGecko
          twitterSource = 'coingecko'
        } else {
          twitterSource = 'defillama'
        }
      }

      if (hasTwitterHandle && finalTwitter) {
        const ethosData = await getUserScoreFromTwitter(finalTwitter)
        if (ethosData) {
          hasEthosScore = true
          ethosScore = ethosData.score
        }
      }

      debugInfo.push({
        name: chain.name,
        hasTwitterHandle,
        twitterHandle: finalTwitter,
        twitterSource,
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
        twitterSource: c.twitterSource,
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
      const source = c.twitterSource === 'manual_override' ? '[OVERRIDE]' :
                     c.twitterSource === 'coingecko' ? '[COINGECKO]' : '[DEFILLAMA]'
      console.log(`${(i + 1).toString().padStart(3)}. ${c.name.padEnd(30)} | @${c.twitterHandle?.padEnd(20)} ${source.padEnd(12)} | MCap: $${(c.stablecoinMCap / 1e9).toFixed(2)}B`)
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
