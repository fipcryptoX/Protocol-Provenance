export type ProtocolCategory =
  | "Lending"
  | "Liquid Staking"
  | "Bridge"
  | "Canonical Bridge"
  | "Restaking"
  | "RWA"
  | "DEX"
  | "Perps"
  | "Stablecoin Apps";

export interface MetricPair {
  stock: {
    label: string;
    value: number;
    unit: string;
  };
  flow: {
    label: string;
    value: number;
    unit: string;
  };
}

export interface EthosData {
  score: number;
  reviewCount: number;
  sentiment?: number;
  trend?: number;
}

export interface Protocol {
  id: string;
  name: string;
  category: ProtocolCategory;
  url?: string;
  description?: string;
  chains: string[];
  ethos: EthosData;
  metrics: MetricPair;
  logo?: string;
  timeframe: string;
}

export interface CategoryMetricConfig {
  stock: {
    label: string;
    apiField: string;
    unit: string;
  };
  flow: {
    label: string;
    apiField: string;
    unit: string;
  };
}

export const CATEGORY_METRICS: Record<ProtocolCategory, CategoryMetricConfig> = {
  "Lending": {
    stock: { label: "TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "Revenue (30d)", apiField: "revenue", unit: "USD/30d" },
  },
  "Liquid Staking": {
    stock: { label: "TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "Protocol Revenue (30d)", apiField: "revenue", unit: "USD/30d" },
  },
  "Bridge": {
    stock: { label: "TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "Bridge Volume (30d)", apiField: "volume", unit: "USD/30d" },
  },
  "Canonical Bridge": {
    stock: { label: "TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "Net Inflow (30d)", apiField: "volume", unit: "USD/30d" },
  },
  "Restaking": {
    stock: { label: "Restaked TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "AVS Revenue (30d)", apiField: "revenue", unit: "USD/30d" },
  },
  "RWA": {
    stock: { label: "RWA TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "Revenue (30d)", apiField: "revenue", unit: "USD/30d" },
  },
  "DEX": {
    stock: { label: "TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "Trading Volume (30d)", apiField: "volume", unit: "USD/30d" },
  },
  "Perps": {
    stock: { label: "Open Interest", apiField: "openInterest", unit: "USD" },
    flow: { label: "Perps Volume (30d)", apiField: "volume", unit: "USD/30d" },
  },
  "Stablecoin Apps": {
    stock: { label: "Stablecoin MCap", apiField: "mcap", unit: "USD" },
    flow: { label: "App Revenue (30d)", apiField: "revenue", unit: "USD/30d" },
  },
};

export type SortOption = "ethos" | "stock" | "flow" | "name";
export type FilterState = {
  categories: ProtocolCategory[];
  chains: string[];
  ethosRange: [number, number];
  stockRange: [number, number];
};
