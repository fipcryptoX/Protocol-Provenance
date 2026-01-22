/**
 * Protocol Provenance Dashboard
 *
 * Dynamic Version:
 * - Automatically fetches all protocols with TVL >= $1B from DefiLlama
 * - Automatically fetches all chains with Stablecoin MCap >= $5M from DefiLlama
 * - Normalizes categories and applies stock/flow pairing
 * - Fetches Ethos scores from Twitter
 * - Renders protocol and chain cards dynamically
 *
 * This is a credibility snapshot, not an analytics terminal.
 * No rankings, comparisons, charts, time ranges, or user inputs.
 */

import { buildAllProtocolCards } from "@/lib/dynamic-protocol-data"
import { buildAllChainCards } from "@/lib/dynamic-chain-data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { AssetCard } from "@/components/ui/asset-card"
import { AlertCircle } from "lucide-react"

export default async function Home() {
  // Dynamically build all protocol cards from DefiLlama
  // Filters protocols with TVL >= $5B
  const protocolCards = await buildAllProtocolCards(5_000_000_000)

  // Dynamically build all chain cards from DefiLlama
  // Filters chains with Stablecoin MCap >= $400M
  // Skip Ethos and CoinGecko during build for faster builds
  const chainCards = await buildAllChainCards(400_000_000, true, true)

  // Combine all cards
  const allCards = [...protocolCards, ...chainCards]

  console.log(`Total cards: ${allCards.length} (${protocolCards.length} protocols, ${chainCards.length} chains)`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header with Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Protocol Provenance
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                View onchain and social metrics for protocols and chains
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>

          {/* Protocol and Chain Cards Grid */}
          {allCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCards.map((card) => (
                <AssetCard
                  key={card.name}
                  name={card.name}
                  avatarUrl={card.avatarUrl}
                  ethosScore={card.ethosScore}
                  category={card.category}
                  tags={card.tags}
                  stockMetric={card.stockMetric}
                  flowMetric={card.flowMetric}
                  reviewDistribution={card.reviewDistribution}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data Found</AlertTitle>
              <AlertDescription>
                No protocols or chains found or failed to load data.
              </AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>
              Data from{" "}
              <a
                href="https://ethos.network"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700 dark:hover:text-slate-300"
              >
                Ethos
              </a>{" "}
              and{" "}
              <a
                href="https://defillama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700 dark:hover:text-slate-300"
              >
                DefiLlama
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
