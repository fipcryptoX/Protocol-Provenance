/**
 * Twitter Handle Overrides
 *
 * Manual overrides for protocols where DefiLlama has outdated or incorrect Twitter handles.
 * Maps protocol name (lowercase) to the correct Twitter username.
 */

export const TWITTER_OVERRIDES: Record<string, string> = {
  // Protocol overrides
  "eigencloud": "eigencloud",
  "eigenlayer": "eigencloud",
  "morpho": "morpho",

  // Chain overrides
  "ethereum": "ethereum",
  "fantom": "FantomFDN",
  "polygon": "0xPolygon",
  "blast": "Blast_L2",
  "ronin": "Ronin_Network",
  "base": "base",
  "solana": "solana",
  "tron": "tronfoundation",
  "arbitrum": "arbitrum",
  "optimism": "Optimism",
  "avalanche": "avax",
  "bsc": "BNBCHAIN",
  "binance": "BNBCHAIN",
  "sonic": "SonicLabs",
  "monad": "monad",
  "hyperliquid": "HyperliquidX",
  "hyperliquid l1": "HyperliquidX",
  "katana": "SkyMavisHQ",
  "kava": "kava_platform",
  "okexchain": "OKX",
  "metis": "MetisL2",
  "berachain": "berachain",
  "linea": "LineaBuild",
  "injective": "injective",
  "sui": "SuiNetwork",
  "stellar": "StellarOrg",
  "tezos": "tezos",
  "near": "nearprotocol",
  "cardano": "Cardano",
  "stacks": "Stacks",
  "ton": "ton_blockchain",
  "icp": "dfinity",
  "movement": "movementlabsxyz",

  // Additional L2s and chains
  "scroll": "Scroll_ZKP",
  "cronos": "cronos_chain",
  "sei": "SeiNetwork",
  "aptos": "Aptos",
  "canto": "CantoPublic",
  "manta": "MantaNetwork",
  "manta atlantic": "MantaNetwork",
  "mode": "modenetwork",
  "zora": "ourZORA",
  "moonriver": "MoonbeamNetwork",
  "arbitrum nova": "arbitrum",
  "gnosis": "gnosischain",
  "xdai": "gnosischain",
  "celo": "Celo",
  "aurora": "auroraisnear",
  "harmony": "harmonyprotocol",
  "moonbeam": "MoonbeamNetwork",
  "zksync era": "zksync",
  "zksync": "zksync",
  "taiko": "taikoxyz",
  "mantle": "0xMantle",
  "x layer": "XLayer_Official",
  "polygon zkevm": "0xPolygonZkEVM",
  "fraxtal": "fraxfinance",
  "boba": "bobanetwork",
  "zetachain": "zetablockchain",
  "core": "Coredao_Org",
}

/**
 * Get the correct Twitter handle for a protocol
 * Checks overrides first, then falls back to the provided handle
 */
export function getCorrectTwitterHandle(protocolName: string, fallbackHandle: string | null): string | null {
  const normalizedName = protocolName.toLowerCase()

  // Check if there's an override
  if (TWITTER_OVERRIDES[normalizedName]) {
    return TWITTER_OVERRIDES[normalizedName]
  }

  // Also check if the fallback handle itself has an override
  if (fallbackHandle && TWITTER_OVERRIDES[fallbackHandle.toLowerCase()]) {
    return TWITTER_OVERRIDES[fallbackHandle.toLowerCase()]
  }

  return fallbackHandle
}
