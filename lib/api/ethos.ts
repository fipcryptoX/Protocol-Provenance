import { EthosData } from "@/types";

const ETHOS_API_BASE = "https://api.ethos.network/v1";

export interface EthosProtocolResponse {
  name: string;
  score: number;
  reviewCount: number;
  sentiment?: number;
}

export async function getEthosScore(protocolName: string): Promise<EthosData> {
  try {
    // Note: This is a placeholder implementation
    // The actual Ethos API endpoint structure should be verified from the documentation
    const response = await fetch(
      `${ETHOS_API_BASE}/protocols/${encodeURIComponent(protocolName)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch Ethos score for ${protocolName}`);
      return {
        score: 0,
        reviewCount: 0,
      };
    }

    const data: EthosProtocolResponse = await response.json();

    return {
      score: data.score || 0,
      reviewCount: data.reviewCount || 0,
      sentiment: data.sentiment,
    };
  } catch (error) {
    console.error(`Error fetching Ethos score for ${protocolName}:`, error);
    return {
      score: 0,
      reviewCount: 0,
    };
  }
}

export async function getBatchEthosScores(
  protocolNames: string[]
): Promise<Map<string, EthosData>> {
  const results = new Map<string, EthosData>();

  // Fetch in parallel
  const promises = protocolNames.map(async (name) => {
    const data = await getEthosScore(name);
    results.set(name, data);
  });

  await Promise.all(promises);

  return results;
}
