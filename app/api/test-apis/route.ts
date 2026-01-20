import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    ethos: null,
    defillama: null,
    errors: []
  }

  // Test Ethos API
  try {
    const ethosResponse = await fetch(
      `https://api.ethos.network/v1/search?query=Hyperliquid&type=target`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    results.ethos = {
      status: ethosResponse.status,
      statusText: ethosResponse.statusText,
      data: ethosResponse.ok ? await ethosResponse.json() : await ethosResponse.text()
    }
  } catch (error: any) {
    results.errors.push({
      api: 'ethos',
      error: error.message
    })
  }

  // Test DefiLlama derivatives API
  try {
    const defillamaResponse = await fetch(
      `https://api.llama.fi/overview/derivatives?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = defillamaResponse.ok ? await defillamaResponse.json() : await defillamaResponse.text()

    results.defillama = {
      status: defillamaResponse.status,
      statusText: defillamaResponse.statusText,
      hasProtocols: data?.protocols ? true : false,
      protocolCount: data?.protocols?.length || 0,
      hyperliquidData: data?.protocols?.find((p: any) =>
        p.name?.toLowerCase().includes('hyperliquid')
      )
    }
  } catch (error: any) {
    results.errors.push({
      api: 'defillama',
      error: error.message
    })
  }

  return NextResponse.json(results, { status: 200 })
}
