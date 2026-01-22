export type ProtocolCategory =
  | "Lending"
  | "Liquid Staking"
  | "Restaking"
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
  "Restaking": {
    stock: { label: "Restaked TVL", apiField: "tvl", unit: "USD" },
    flow: { label: "AVS Revenue (30d)", apiField: "revenue", unit: "USD/30d" },
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

/**
 * Time range options for charts
 */
export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "All";

/**
 * Combined data point for chart display
 */
export interface ChartDataPoint {
  timestamp: number
  date: string
  stock: number | null
  flow: number | null
}

/**
 * Weekly review aggregation for markers
 */
export interface WeeklyReviewData {
  weekStart: number
  weekEnd: number
  reviewCount: number
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  dominantSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE"
  reviews: Array<{
    id: string
    createdAt: string
    content: string
    reviewScore: "POSITIVE" | "NEUTRAL" | "NEGATIVE"
    author: {
      id: number
      displayName?: string
      username?: string
      avatarUrl?: string
      score: number
    }
  }>
}
