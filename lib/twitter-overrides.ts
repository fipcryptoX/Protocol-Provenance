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

  // Chain overrides - Layer 1s
  "ethereum": "ethereum",
  "bitcoin": "bitcoin",
  "solana": "solana",
  "tron": "trondao",
  "sui": "SuiNetwork",
  "aptos": "Aptos",
  "near": "nearprotocol",
  "cardano": "Cardano",
  "polkadot": "Polkadot",
  "avalanche": "avax",
  "polygon": "0xPolygon",
  "fantom": "FantomFDN",
  "algorand": "Algorand",
  "tezos": "tezos",
  "stellar": "StellarOrg",
  "ton": "ton_blockchain",
  "icp": "dfinity",
  "cosmos": "cosmos",
  "osmosis": "osmosiszone",
  "injective": "Injective_",
  "sei": "SeiNetwork",
  "waves": "wavesprotocol",
  "flow": "flow_blockchain",
  "hedera": "hedera",
  "stacks": "Stacks",

  // Chain overrides - Layer 2s & Sidechains
  "base": "base",
  "arbitrum": "arbitrum",
  "optimism": "Optimism",
  "polygon zkevm": "0xPolygon",
  "zksync": "zksync",
  "scroll": "Scroll_ZKP",
  "linea": "LineaBuild",
  "blast": "Blast_L2",
  "metis": "MetisDAO",
  "boba": "bobanetwork",
  "immutable x": "Immutable",
  "immutable zkevm": "Immutable",
  "loopring": "loopringorg",
  "zora": "ourZORA",
  "manta": "MantaNetwork",
  "mantle": "0xMantle",
  "taiko": "taikoxyz",

  // Chain overrides - Alt L1s & App Chains
  "berachain": "berachain",
  "monad": "monad_xyz",
  "sonic": "SonicLabs",
  "kava": "kava_platform",
  "hyperliquid l1": "HyperliquidX",
  "canto": "CantoPublic",
  "cronos": "cronos_chain",
  "moonbeam": "MoonbeamNetwork",
  "moonriver": "MoonriverNW",
  "flare": "FlareNetworks",
  "world chain": "worldcoin",
  "abstract": "abstractchain",
  "soneium": "soneium",
  "movement": "movementlabsxyz",
  "mezo": "MezoNetwork",
  "noble": "noble_xyz",
  "plume mainnet": "PlumenetworkIO",
  "katana": "RoninNetwork",

  // Chain overrides - Others
  "binance": "binance",
  "plasma": "PlasmaNetwork_",
  "okexchain": "OKExChain",
  "xdc": "XinFin_Official",
  "smartbch": "SmartBCH",
  "mixin": "MixinKernel",
  "provenance": "provenancefdn",
  "corn": "getcorn",
  "fogo": "fogometa",
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
