import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    hyperliquidApi: null,
    defillamaVolume: null,
    defillamaProtocol: null,
    errors: []
  }

  // Test Hyperliquid's own API
  try {
    const hyperliquidResponse = await fetch(
      `https://api.hyperliquid.xyz/info`,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "metaAndAssetCtxs" })
      }
    )

    if (hyperliquidResponse.ok) {
      const data = await hyperliquidResponse.json()
      const totalOI = data.assetCtxs?.reduce((sum: number, asset: any) =>
        sum + (parseFloat(asset.openInterest) || 0), 0
      )
      const totalVol = data.assetCtxs?.reduce((sum: number, asset: any) =>
        sum + (parseFloat(asset.dayNtlVlm) || 0), 0
      )

      results.hyperliquidApi = {
        status: 'success',
        totalOpenInterest: totalOI,
        total24hVolume: totalVol,
        assetCount: data.assetCtxs?.length
      }
    }
  } catch (error: any) {
    results.errors.push({
      api: 'hyperliquid',
      error: error.message
    })
  }

  // Test DefiLlama derivatives/volume API
  try {
    const volumeResponse = await fetch(
      `https://api.llama.fi/overview/derivatives?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume`
    )

    if (volumeResponse.ok) {
      const data = await volumeResponse.json()
      const hyperliquid = data?.protocols?.find((p: any) =>
        p.name?.toLowerCase().includes('hyperliquid')
      )

      results.defillamaVolume = {
        status: 'success',
        total24h: hyperliquid?.total24h,
        allFields: Object.keys(hyperliquid || {})
      }
    }
  } catch (error: any) {
    results.errors.push({
      api: 'defillama-volume',
      error: error.message
    })
  }

  // Test DefiLlama protocol endpoint for TVL/other metrics
  try {
    const protocolResponse = await fetch(
      `https://api.llama.fi/protocol/hyperliquid`
    )

    if (protocolResponse.ok) {
      const data = await protocolResponse.json()
      results.defillamaProtocol = {
        status: 'success',
        tvl: data.tvl,
        chainTvls: data.chainTvls,
        availableFields: Object.keys(data || {})
      }
    }
  } catch (error: any) {
    results.errors.push({
      api: 'defillama-protocol',
      error: error.message
    })
  }

  return NextResponse.json(results, { status: 200 })
}
