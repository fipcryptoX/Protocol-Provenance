/**
 * Protocol Provenance Dashboard
 *
 * v0 Scope:
 * - Displays a single protocol card (Hyperliquid)
 * - Uses live production APIs (Ethos + DefiLlama)
 * - Stock-flow pairing enforced
 * - Architecturally supports multiple protocols via configuration
 *
 * This is a credibility snapshot, not an analytics terminal.
 * No rankings, comparisons, charts, time ranges, or user inputs.
 */

import { AssetCard } from "@/components/ui/asset-card"
import { getProtocolConfig } from "@/lib/protocol-config"
import { fetchProtocolDataSafe } from "@/lib/protocol-data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function Home() {
  // Get Hyperliquid configuration
  const hyperliquidConfig = getProtocolConfig("hyperliquid")

  if (!hyperliquidConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Hyperliquid protocol configuration not found
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Fetch live data from Ethos and DefiLlama
  const protocolData = await fetchProtocolDataSafe(hyperliquidConfig)

  // Handle error state
  if (!protocolData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Fetch Error</AlertTitle>
          <AlertDescription>
            Failed to fetch live data for {hyperliquidConfig.displayName}.
            Please check the API endpoints and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Protocol Provenance
            </h1>
            <p className="text-lg text-slate-600">
              DeFi sensemaking through belief and behavior
            </p>
          </div>

          {/* Protocol Card */}
          <div className="flex justify-center">
            <AssetCard
              name={protocolData.name}
              avatarUrl={protocolData.avatarUrl}
              ethosScore={protocolData.ethosScore}
              stockMetric={protocolData.stockMetric}
              flowMetric={protocolData.flowMetric}
            />
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500">
            <p>
              Data from{" "}
              <a
                href="https://ethos.network"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700"
              >
                Ethos
              </a>{" "}
              and{" "}
              <a
                href="https://defillama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700"
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
