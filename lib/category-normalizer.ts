/**
 * Category Normalization and Mapping Logic
 *
 * Handles:
 * - Category name normalization (Derivatives → Perps, Dexes → DEX, etc.)
 * - Stock/Flow metric mapping per category
 */

/**
 * Normalized category names used in the app
 */
export type NormalizedCategory =
  | "Perps"
  | "DEX"
  | "Lending"
  | "Liquid Staking"
  | "Stablecoin Apps"
  | "Restaking"
  | "Chain"
  | "CDP"
  | "Yield"
  | "Liquid Restaking"

/**
 * Category normalization map
 * Maps DefiLlama category names to our internal category names
 */
const CATEGORY_NORMALIZATION_MAP: Record<string, NormalizedCategory> = {
  // Perps
  "Derivatives": "Perps",
  "Perps": "Perps",

  // DEX
  "Dexes": "DEX",
  "Dexs": "DEX", // API sometimes returns "Dexs" instead of "Dexes"
  "DEX": "DEX",

  // Lending
  "Lending": "Lending",

  // Liquid Staking
  "Liquid Staking": "Liquid Staking",

  // Liquid Restaking
  "Liquid Restaking": "Liquid Restaking",

  // Stablecoins
  "Stablecoin": "Stablecoin Apps",
  "Stablecoins": "Stablecoin Apps",
  "Stablecoin Apps": "Stablecoin Apps",

  // Restaking
  "Restaking": "Restaking",

  // CDP
  "CDP": "CDP",

  // Yield
  "Yield": "Yield",

  // Chain
  "Chain": "Chain",
}

/**
 * Normalize a DefiLlama category name to our internal category
 */
export function normalizeCategory(defiLlamaCategory: string): NormalizedCategory | null {
  const normalized = CATEGORY_NORMALIZATION_MAP[defiLlamaCategory]
  if (!normalized) {
    console.warn(`Unknown category: ${defiLlamaCategory}`)
    return null
  }
  return normalized
}

/**
 * Check if a category is supported
 */
export function isSupportedCategory(category: string): boolean {
  return category in CATEGORY_NORMALIZATION_MAP
}

/**
 * Metric configuration for a category
 */
export interface CategoryMetrics {
  stock: {
    label: string
    source: "protocols" | "open-interest" | "stablecoins"
    field: string
  }
  flow: {
    label: string
    source: "derivatives" | "dexes" | "revenue"
    field: string
  }
}

/**
 * Category to metrics mapping
 *
 * Defines what stock and flow metrics to use for each category
 */
export const CATEGORY_METRICS_MAP: Record<NormalizedCategory, CategoryMetrics> = {
  "Perps": {
    stock: {
      label: "24h Open Interest",
      source: "open-interest",
      field: "dailyOpenInterest"
    },
    flow: {
      label: "24h Volume",
      source: "derivatives",
      field: "total24h"
    }
  },

  "DEX": {
    stock: {
      label: "TVL",
      source: "protocols",
      field: "tvl"
    },
    flow: {
      label: "24h Trading Volume",
      source: "dexes",
      field: "total24h"
    }
  },

  "Lending": {
    stock: {
      label: "TVL",
      source: "protocols",
      field: "tvl"
    },
    flow: {
      label: "24h Revenue",
      source: "revenue",
      field: "total24h"
    }
  },

  "Liquid Staking": {
    stock: {
      label: "TVL",
      source: "protocols",
      field: "tvl"
    },
    flow: {
      label: "24h Revenue",
      source: "revenue",
      field: "total24h"
    }
  },

  "Stablecoin Apps": {
    stock: {
      label: "Stablecoin MCap",
      source: "stablecoins",
      field: "totalCirculatingUSD"
    },
    flow: {
      label: "24h Revenue",
      source: "revenue",
      field: "total24h"
    }
  },

  "Restaking": {
    stock: {
      label: "TVL",
      source: "protocols",
      field: "tvl"
    },
    flow: {
      label: "24h Revenue",
      source: "revenue",
      field: "total24h"
    }
  },

  "Chain": {
    stock: {
      label: "Stablecoin MCAP",
      source: "stablecoins",
      field: "stablecoinMCap"
    },
    flow: {
      label: "24h App Revenue",
      source: "revenue",
      field: "total24h"
    }
  },

  "CDP": {
    stock: {
      label: "TVL",
      source: "protocols",
      field: "tvl"
    },
    flow: {
      label: "24h Revenue",
      source: "revenue",
      field: "total24h"
    }
  },

  "Yield": {
    stock: {
      label: "TVL",
      source: "protocols",
      field: "tvl"
    },
    flow: {
      label: "24h Revenue",
      source: "revenue",
      field: "total24h"
    }
  },

  "Liquid Restaking": {
    stock: {
      label: "TVL",
      source: "protocols",
      field: "tvl"
    },
    flow: {
      label: "24h Revenue",
      source: "revenue",
      field: "total24h"
    }
  }
}

/**
 * Get metric configuration for a category
 */
export function getCategoryMetrics(category: NormalizedCategory): CategoryMetrics {
  return CATEGORY_METRICS_MAP[category]
}

/**
 * Get all supported categories
 */
export function getSupportedCategories(): NormalizedCategory[] {
  return Object.keys(CATEGORY_METRICS_MAP) as NormalizedCategory[]
}
