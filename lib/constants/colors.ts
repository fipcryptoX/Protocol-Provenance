/**
 * Wonderland Color Scheme for Protocol Type Tags
 * Based on the provided design system
 */

export const WONDERLAND_COLORS = {
  // Pink shades
  FF6EFF: { light: "#FF6EFF", dark: "#FF6EFF", name: "Fuchsia" },
  FF6CD3: { light: "#FF6CD3", dark: "#FF6CD3", name: "Hot Pink" },
  FF6CA9: { light: "#FF6CA9", dark: "#FF6CA9", name: "Pink" },
  FF748B: { light: "#FF748B", dark: "#FF748B", name: "Salmon" },

  // Orange shades
  FF8A6B: { light: "#FF8A6B", dark: "#FF8A6B", name: "Coral" },
  FFAE4F: { light: "#FFAE4F", dark: "#FFAE4F", name: "Orange" },

  // Green
  "00D498": { light: "#00D498", dark: "#00D498", name: "Emerald" },

  // Cyan/Blue shades
  "00C8F0": { light: "#00C8F0", dark: "#00C8F0", name: "Cyan" },
  "1FB4FF": { light: "#1FB4FF", dark: "#1FB4FF", name: "Sky Blue" },
  "4C97FF": { light: "#4C97FF", dark: "#4C97FF", name: "Blue" },
  "6080FF": { light: "#6080FF", dark: "#6080FF", name: "Royal Blue" },

  // Purple shades
  "8E77FF": { light: "#8E77FF", dark: "#8E77FF", name: "Purple" },
  C86EFF: { light: "#C86EFF", dark: "#C86EFF", name: "Violet" },
  FB719A: { light: "#FB719A", dark: "#FB719A", name: "Rose" },
} as const

export type WonderlandColorKey = keyof typeof WONDERLAND_COLORS

/**
 * Protocol type to color mapping
 */
export const PROTOCOL_TYPE_COLORS: Record<string, WonderlandColorKey> = {
  // Perps category
  perps: "FF6EFF",
  derivatives: "FF6CD3",

  // DEX category
  dex: "00C8F0",
  "spot-dex": "1FB4FF",
  "amm": "4C97FF",

  // Lending category
  lending: "8E77FF",
  "money-market": "C86EFF",

  // Bridge category
  bridge: "00D498",
  "cross-chain": "00D498",

  // Staking category
  "liquid-staking": "6080FF",
  staking: "6080FF",

  // Restaking
  restaking: "FFAE4F",

  // RWA
  rwa: "FF8A6B",
  "real-world-assets": "FF8A6B",

  // Stablecoins
  stablecoin: "FB719A",
  "stablecoin-apps": "FB719A",

  // Chain
  chain: "FF748B",
} as const

/**
 * Get the color configuration for a protocol type
 */
export function getProtocolTypeColor(type: string): typeof WONDERLAND_COLORS[WonderlandColorKey] {
  const colorKey = PROTOCOL_TYPE_COLORS[type.toLowerCase()] || "4C97FF"
  return WONDERLAND_COLORS[colorKey]
}
