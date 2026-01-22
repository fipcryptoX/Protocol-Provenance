/**
 * Diagnostic script to check which chains from DeFiLlama have Twitter handles
 */

async function checkChainTwitterData() {
  try {
    console.log('Fetching chains from DeFiLlama API...\n')

    const response = await fetch('https://api.llama.fi/chains')
    const chains = await response.json()

    console.log(`Total chains fetched: ${chains.length}\n`)

    // Separate chains into those with and without twitter
    const withTwitter: any[] = []
    const withoutTwitter: any[] = []

    chains.forEach((chain: any) => {
      if (chain.twitter) {
        withTwitter.push(chain)
      } else {
        withoutTwitter.push(chain)
      }
    })

    console.log(`✓ Chains WITH Twitter handle: ${withTwitter.length}`)
    console.log(`✗ Chains WITHOUT Twitter handle: ${withoutTwitter.length}\n`)

    console.log('='*80)
    console.log('CHAINS WITH TWITTER HANDLES (sorted by TVL):')
    console.log('='*80)

    withTwitter
      .sort((a, b) => b.tvl - a.tvl)
      .forEach((chain, index) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${chain.name.padEnd(30)} | @${chain.twitter.padEnd(20)} | TVL: $${(chain.tvl / 1e9).toFixed(2)}B`)
      })

    console.log('\n' + '='*80)
    console.log('CHAINS WITHOUT TWITTER HANDLES (sorted by TVL):')
    console.log('='*80)

    withoutTwitter
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 50) // Show top 50 by TVL
      .forEach((chain, index) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${chain.name.padEnd(30)} | TVL: $${(chain.tvl / 1e9).toFixed(2)}B`)
      })

    console.log('\n' + '='*80)
    console.log('SUMMARY')
    console.log('='*80)
    console.log(`Coverage: ${((withTwitter.length / chains.length) * 100).toFixed(1)}% of chains have Twitter handles`)

    // Check top chains by TVL
    const top20ByTVL = chains.sort((a: any, b: any) => b.tvl - a.tvl).slice(0, 20)
    const top20WithTwitter = top20ByTVL.filter((c: any) => c.twitter)

    console.log(`\nTop 20 chains by TVL: ${top20WithTwitter.length}/20 have Twitter handles`)

  } catch (error) {
    console.error('Error fetching chain data:', error)
  }
}

checkChainTwitterData()
