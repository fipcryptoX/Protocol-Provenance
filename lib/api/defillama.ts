const DEFILLAMA_API_BASE = "https://api.llama.fi";

export interface DefiLlamaProtocol {
  id: string;
  name: string;
  address?: string;
  symbol?: string;
  url?: string;
  description?: string;
  chain: string;
  logo?: string;
  audits?: string;
  audit_note?: string;
  gecko_id?: string;
  cmcId?: string;
  category: string;
  chains: string[];
  module?: string;
  twitter?: string;
  forkedFrom?: string[];
  oracles?: string[];
  listedAt?: number;
  methodology?: string;
  slug: string;
  tvl: number;
  chainTvls: Record<string, number>;
  change_1h?: number;
  change_1d?: number;
  change_7d?: number;
  fdv?: number;
  mcap?: number;
}

export interface ProtocolMetrics {
  tvl: number;
  revenue?: number;
  volume?: number;
  fees?: number;
  openInterest?: number;
  mcap?: number;
}

export async function getProtocols(): Promise<DefiLlamaProtocol[]> {
  try {
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocols`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch protocols");
    }

    const protocols: DefiLlamaProtocol[] = await response.json();
    return protocols;
  } catch (error) {
    console.error("Error fetching DefiLlama protocols:", error);
    return [];
  }
}

export async function getProtocol(slug: string): Promise<DefiLlamaProtocol | null> {
  try {
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocol/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const protocol: DefiLlamaProtocol = await response.json();
    return protocol;
  } catch (error) {
    console.error(`Error fetching protocol ${slug}:`, error);
    return null;
  }
}

export async function getProtocolRevenue(protocolName: string): Promise<number> {
  try {
    // DefiLlama fees/revenue endpoint
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/summary/fees/${protocolName}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    // Get 30d revenue if available
    return data.total30d || data.totalRevenue30d || 0;
  } catch (error) {
    console.error(`Error fetching revenue for ${protocolName}:`, error);
    return 0;
  }
}

export async function getProtocolVolume(protocolSlug: string): Promise<number> {
  try {
    // DEX volume endpoint
    const response = await fetch(
      `${DEFILLAMA_API_BASE}/summary/dexs/${protocolSlug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.total30d || 0;
  } catch (error) {
    console.error(`Error fetching volume for ${protocolSlug}:`, error);
    return 0;
  }
}

export async function getProtocolMetrics(
  protocol: DefiLlamaProtocol
): Promise<ProtocolMetrics> {
  const metrics: ProtocolMetrics = {
    tvl: protocol.tvl || 0,
    mcap: protocol.mcap || 0,
  };

  // Fetch additional metrics based on category
  try {
    const [revenue, volume] = await Promise.all([
      getProtocolRevenue(protocol.slug),
      getProtocolVolume(protocol.slug),
    ]);

    metrics.revenue = revenue;
    metrics.volume = volume;
  } catch (error) {
    console.error(`Error fetching metrics for ${protocol.name}:`, error);
  }

  return metrics;
}
