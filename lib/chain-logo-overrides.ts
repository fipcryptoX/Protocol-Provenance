/**
 * Chain Logo System
 *
 * Uses high-quality logos from CoinGecko for major chains.
 * Falls back to DefiLlama CDN for chains not in the override list.
 */

/**
 * High-quality logo URLs from CoinGecko
 * CoinGecko provides better resolution images than DefiLlama's resized versions
 */
export const CHAIN_LOGO_OVERRIDES: Record<string, string> = {
  // Major L1s with high-quality CoinGecko logos
  "ethereum": "https://coin-images.coingecko.com/asset_platforms/images/279/large/ethereum.png",
  "solana": "https://coin-images.coingecko.com/asset_platforms/images/5/large/solana.png",
  "tron": "https://coin-images.coingecko.com/asset_platforms/images/1094/large/TRON_LOGO.png",
  "avalanche": "https://coin-images.coingecko.com/asset_platforms/images/12/large/avalanche.png",
  "binance": "https://coin-images.coingecko.com/asset_platforms/images/1/large/binance-smart-chain.png",
  "bsc": "https://coin-images.coingecko.com/asset_platforms/images/1/large/binance-smart-chain.png",
  "polygon": "https://coin-images.coingecko.com/asset_platforms/images/15/large/polygon_pos.png",
  "fantom": "https://coin-images.coingecko.com/asset_platforms/images/250/large/fantom.png",
  "near": "https://coin-images.coingecko.com/asset_platforms/images/26/large/near.png",
  "aptos": "https://coin-images.coingecko.com/asset_platforms/images/86/large/aptos.png",
  "sui": "https://coin-images.coingecko.com/asset_platforms/images/219/large/sui.png",
  "cardano": "https://coin-images.coingecko.com/asset_platforms/images/1/large/cardano.png",
  "stellar": "https://coin-images.coingecko.com/asset_platforms/images/9/large/stellar.png",
  "ton": "https://coin-images.coingecko.com/asset_platforms/images/235/large/ton.png",
  "icp": "https://coin-images.coingecko.com/asset_platforms/images/48/large/internet-computer.png",
  "cosmos": "https://coin-images.coingecko.com/asset_platforms/images/23/large/cosmos.png",
  "injective": "https://coin-images.coingecko.com/asset_platforms/images/111/large/injective.png",
  "sei": "https://coin-images.coingecko.com/asset_platforms/images/197/large/sei.png",
  "celo": "https://coin-images.coingecko.com/asset_platforms/images/44/large/celo.png",
  "tezos": "https://coin-images.coingecko.com/asset_platforms/images/17/large/tezos.png",
  "stacks": "https://coin-images.coingecko.com/asset_platforms/images/42/large/stacks.png",
  "harmony": "https://coin-images.coingecko.com/asset_platforms/images/45/large/harmony.png",
  "aurora": "https://coin-images.coingecko.com/asset_platforms/images/90/large/aurora.png",
  "cronos": "https://coin-images.coingecko.com/asset_platforms/images/65/large/cronos.png",
  "kava": "https://coin-images.coingecko.com/asset_platforms/images/69/large/kava.png",
  "canto": "https://coin-images.coingecko.com/asset_platforms/images/151/large/canto.png",

  // L2s and Scaling Solutions
  "base": "https://coin-images.coingecko.com/asset_platforms/images/131/large/base.png",
  "arbitrum": "https://coin-images.coingecko.com/asset_platforms/images/33/large/arbitrum.png",
  "optimism": "https://coin-images.coingecko.com/asset_platforms/images/1059/large/optimism.png",
  "blast": "https://coin-images.coingecko.com/asset_platforms/images/305/large/blast.jpeg",
  "scroll": "https://coin-images.coingecko.com/asset_platforms/images/227/large/scroll.png",
  "zksync era": "https://coin-images.coingecko.com/asset_platforms/images/133/large/zksync.png",
  "zksync": "https://coin-images.coingecko.com/asset_platforms/images/133/large/zksync.png",
  "polygon zkevm": "https://coin-images.coingecko.com/asset_platforms/images/134/large/polygon-zkevm.png",
  "linea": "https://coin-images.coingecko.com/asset_platforms/images/207/large/linea.png",
  "mantle": "https://coin-images.coingecko.com/asset_platforms/images/169/large/mantle.png",
  "arbitrum nova": "https://coin-images.coingecko.com/asset_platforms/images/127/large/arbitrum-nova.png",
  "metis": "https://coin-images.coingecko.com/asset_platforms/images/82/large/metis.png",
  "boba": "https://coin-images.coingecko.com/asset_platforms/images/68/large/boba.png",
  "mode": "https://coin-images.coingecko.com/asset_platforms/images/289/large/mode.png",
  "zora": "https://coin-images.coingecko.com/asset_platforms/images/242/large/zora.png",
  "fraxtal": "https://coin-images.coingecko.com/asset_platforms/images/300/large/fraxtal.png",
  "manta": "https://coin-images.coingecko.com/asset_platforms/images/232/large/manta.png",
  "manta atlantic": "https://coin-images.coingecko.com/asset_platforms/images/232/large/manta.png",
  "taiko": "https://coin-images.coingecko.com/asset_platforms/images/310/large/taiko.png",
  "x layer": "https://coin-images.coingecko.com/asset_platforms/images/293/large/x-layer.png",

  // Other chains and ecosystems
  "ronin": "https://coin-images.coingecko.com/asset_platforms/images/1388/large/ronin.png",
  "katana": "https://coin-images.coingecko.com/asset_platforms/images/1388/large/ronin.png",
  "sonic": "https://coin-images.coingecko.com/asset_platforms/images/250/large/fantom.png",
  "berachain": "https://coin-images.coingecko.com/asset_platforms/images/321/large/berachain.png",
  "monad": "https://icons.llama.fi/icons/chains/rsz_monad.jpg",
  "hyperliquid": "https://icons.llama.fi/icons/chains/rsz_hyperliquid.jpg",
  "movement": "https://icons.llama.fi/icons/chains/rsz_movement.jpg",
  "gnosis": "https://coin-images.coingecko.com/asset_platforms/images/11062/large/Gnosis.png",
  "xdai": "https://coin-images.coingecko.com/asset_platforms/images/11062/large/Gnosis.png",
  "moonbeam": "https://coin-images.coingecko.com/asset_platforms/images/62/large/moonbeam.png",
  "moonriver": "https://coin-images.coingecko.com/asset_platforms/images/63/large/moonriver.png",
  "zetachain": "https://coin-images.coingecko.com/asset_platforms/images/203/large/zetachain.png",
  "core": "https://coin-images.coingecko.com/asset_platforms/images/183/large/core.png",
  "okexchain": "https://icons.llama.fi/icons/chains/rsz_okexchain.jpg",
}

/**
 * Get the logo URL for a chain
 * Prioritizes high-quality CoinGecko images, falls back to DefiLlama CDN
 */
export function getCorrectChainLogo(chainName: string, fallbackLogo: string | null): string | null {
  const normalizedName = chainName.toLowerCase()

  // Check if there's a high-quality CoinGecko logo
  if (CHAIN_LOGO_OVERRIDES[normalizedName]) {
    return CHAIN_LOGO_OVERRIDES[normalizedName]
  }

  // If DefiLlama provided a logo, use it
  if (fallbackLogo) {
    return fallbackLogo
  }

  // Auto-generate logo URL from DefiLlama CDN as fallback
  // Format: https://icons.llama.fi/icons/chains/rsz_[chainname].jpg
  const formattedName = chainName.toLowerCase().replace(/\s+/g, '')
  return `https://icons.llama.fi/icons/chains/rsz_${formattedName}.jpg`
}
