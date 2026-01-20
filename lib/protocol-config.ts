/**
 * Protocol Configuration System
 *
 * This file defines the canonical protocol configuration structure.
 * All protocol-specific decisions must live here and only here.
 *
 * To add a new protocol:
 * 1. Add a new ProtocolConfig to the PROTOCOLS object
 * 2. Specify Ethos search name, DefiLlama category/slug, and stock/flow metrics
 * 3. No changes needed to UI components or fetching logic
 */

export type DefiLlamaCategory = "perps" | "dex" | "lending" | "bridge"

export interface MetricConfig {
  label: string
  source: "defillama"
  field: string
}

export interface ProtocolConfig {
  id: string
  displayName: string
  category: string // Display category (e.g., "perps", "dex", "lending")
  tags?: string[] // Protocol type tags (e.g., ["derivatives", "orderbook"])

  ethos: {
    searchName: string
    twitterUsername?: string // Optional Twitter username for user score lookup
  }

  defillama: {
    protocolSlug: string
    category: DefiLlamaCategory
  }

  metrics: {
    stock: MetricConfig
    flow: MetricConfig
  }
}

/**
 * Protocol Configurations
 *
 * This is the single source of truth for all protocol definitions.
 */
export const PROTOCOLS: Record<string, ProtocolConfig> = {
  hyperliquid: {
    id: "hyperliquid",
    displayName: "Hyperliquid",
    category: "perps",

    ethos: {
      searchName: "Hyperliquid",
      twitterUsername: "HyperliquidX"
    },

    defillama: {
      protocolSlug: "hyperliquid",
      category: "perps"
    },

    metrics: {
      stock: {
        label: "24h Open Interest",
        source: "defillama",
        field: "dailyOpenInterest"
      },
      flow: {
        label: "24h Volume",
        source: "defillama",
        field: "total24h"
      }
    }
  },
  lighter: {
    id: "lighter",
    displayName: "Lighter",
    category: "perps",

    ethos: {
      searchName: "Lighter",
      twitterUsername: "lighter_xyz"
    },

    defillama: {
      protocolSlug: "lighter",
      category: "perps"
    },

    metrics: {
      stock: {
        label: "24h Open Interest",
        source: "defillama",
        field: "dailyOpenInterest"
      },
      flow: {
        label: "24h Volume",
        source: "defillama",
        field: "total24h"
      }
    }
  }
}

/**
 * Get a protocol configuration by ID
 */
export function getProtocolConfig(protocolId: string): ProtocolConfig | undefined {
  return PROTOCOLS[protocolId]
}

/**
 * Get all protocol configurations
 */
export function getAllProtocolConfigs(): ProtocolConfig[] {
  return Object.values(PROTOCOLS)
}
