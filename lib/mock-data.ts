import { Protocol, ProtocolCategory, CATEGORY_METRICS } from "@/types";

// Mock data for testing the dashboard
export const mockProtocols: Protocol[] = [
  {
    id: "aave",
    name: "Aave",
    category: "Lending",
    url: "https://aave.com",
    description: "Decentralized non-custodial liquidity protocol where users can participate as suppliers or borrowers",
    chains: ["Ethereum", "Polygon", "Avalanche"],
    ethos: {
      score: 8.5,
      reviewCount: 234,
      sentiment: 0.85,
    },
    metrics: {
      stock: {
        label: CATEGORY_METRICS["Lending"].stock.label,
        value: 5_420_000_000,
        unit: CATEGORY_METRICS["Lending"].stock.unit,
      },
      flow: {
        label: CATEGORY_METRICS["Lending"].flow.label,
        value: 12_500_000,
        unit: CATEGORY_METRICS["Lending"].flow.unit,
      },
    },
    timeframe: "30d",
  },
  {
    id: "uniswap",
    name: "Uniswap",
    category: "DEX",
    url: "https://uniswap.org",
    description: "Leading decentralized exchange protocol for swapping ERC20 tokens on Ethereum",
    chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism"],
    ethos: {
      score: 9.2,
      reviewCount: 456,
      sentiment: 0.92,
    },
    metrics: {
      stock: {
        label: CATEGORY_METRICS["DEX"].stock.label,
        value: 3_850_000_000,
        unit: CATEGORY_METRICS["DEX"].stock.unit,
      },
      flow: {
        label: CATEGORY_METRICS["DEX"].flow.label,
        value: 45_000_000_000,
        unit: CATEGORY_METRICS["DEX"].flow.unit,
      },
    },
    timeframe: "30d",
  },
  {
    id: "lido",
    name: "Lido",
    category: "Liquid Staking",
    url: "https://lido.fi",
    description: "Liquid staking solution for Ethereum and other proof-of-stake blockchains",
    chains: ["Ethereum", "Polygon", "Solana"],
    ethos: {
      score: 8.8,
      reviewCount: 189,
      sentiment: 0.88,
    },
    metrics: {
      stock: {
        label: CATEGORY_METRICS["Liquid Staking"].stock.label,
        value: 14_200_000_000,
        unit: CATEGORY_METRICS["Liquid Staking"].stock.unit,
      },
      flow: {
        label: CATEGORY_METRICS["Liquid Staking"].flow.label,
        value: 8_900_000,
        unit: CATEGORY_METRICS["Liquid Staking"].flow.unit,
      },
    },
    timeframe: "30d",
  },
  {
    id: "gmx",
    name: "GMX",
    category: "Perps",
    url: "https://gmx.io",
    description: "Decentralized perpetual exchange with low swap fees and zero price impact trades",
    chains: ["Arbitrum", "Avalanche"],
    ethos: {
      score: 7.9,
      reviewCount: 145,
      sentiment: 0.79,
    },
    metrics: {
      stock: {
        label: CATEGORY_METRICS["Perps"].stock.label,
        value: 450_000_000,
        unit: CATEGORY_METRICS["Perps"].stock.unit,
      },
      flow: {
        label: CATEGORY_METRICS["Perps"].flow.label,
        value: 2_100_000_000,
        unit: CATEGORY_METRICS["Perps"].flow.unit,
      },
    },
    timeframe: "30d",
  },
  {
    id: "makerdao",
    name: "MakerDAO",
    category: "Lending",
    url: "https://makerdao.com",
    description: "Decentralized credit platform that enables the generation of DAI stablecoin",
    chains: ["Ethereum"],
    ethos: {
      score: 8.3,
      reviewCount: 312,
      sentiment: 0.83,
    },
    metrics: {
      stock: {
        label: CATEGORY_METRICS["Lending"].stock.label,
        value: 6_780_000_000,
        unit: CATEGORY_METRICS["Lending"].stock.unit,
      },
      flow: {
        label: CATEGORY_METRICS["Lending"].flow.label,
        value: 15_600_000,
        unit: CATEGORY_METRICS["Lending"].flow.unit,
      },
    },
    timeframe: "30d",
  },
  {
    id: "curve",
    name: "Curve Finance",
    category: "DEX",
    url: "https://curve.fi",
    description: "Exchange liquidity pool designed for efficient stablecoin trading",
    chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism"],
    ethos: {
      score: 8.1,
      reviewCount: 267,
      sentiment: 0.81,
    },
    metrics: {
      stock: {
        label: CATEGORY_METRICS["DEX"].stock.label,
        value: 2_340_000_000,
        unit: CATEGORY_METRICS["DEX"].stock.unit,
      },
      flow: {
        label: CATEGORY_METRICS["DEX"].flow.label,
        value: 8_500_000_000,
        unit: CATEGORY_METRICS["DEX"].flow.unit,
      },
    },
    timeframe: "30d",
  },
  {
    id: "eigenlayer",
    name: "EigenLayer",
    category: "Restaking",
    url: "https://eigenlayer.xyz",
    description: "Restaking protocol that allows staked ETH to secure additional services",
    chains: ["Ethereum"],
    ethos: {
      score: 7.5,
      reviewCount: 89,
      sentiment: 0.75,
    },
    metrics: {
      stock: {
        label: CATEGORY_METRICS["Restaking"].stock.label,
        value: 1_200_000_000,
        unit: CATEGORY_METRICS["Restaking"].stock.unit,
      },
      flow: {
        label: CATEGORY_METRICS["Restaking"].flow.label,
        value: 3_400_000,
        unit: CATEGORY_METRICS["Restaking"].flow.unit,
      },
    },
    timeframe: "30d",
  },
];
