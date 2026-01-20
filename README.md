# Protocol Provenance

A DeFi sensemaking dashboard that helps users identify reputable DeFi protocols by pairing social credibility (Ethos) with onchain performance metrics (DefiLlama) using stock-flow metric pairs.

## Overview

Protocol Provenance is designed for power users, researchers, builders, and analysts who need to quickly assess the credibility and performance of DeFi protocols. The dashboard combines:

- **Social Credibility (Ethos)**: Reputation-weighted belief and community sentiment
- **Onchain Performance (DefiLlama)**: Hard metrics like TVL, revenue, volume, and more

## Core Principle

**Always pair a stock metric with a flow metric.**

- **Stock** measures accumulated trust and capital commitment
- **Flow** measures ongoing activity and willingness to pay

A stock without a flow ≈ idle or decaying
A flow without a stock ≈ mercenary or unstable
Stock + flow ≈ harder to fake, more meaningful

## Features

### Category-Specific Metrics

Each DeFi protocol category has specific stock-flow metric pairs:

| Category | Stock Metric | Flow Metric |
|----------|-------------|-------------|
| Lending | TVL | Revenue (30d) |
| Liquid Staking | TVL | Protocol Revenue (30d) |
| Bridge | TVL | Bridge Volume (30d) |
| Canonical Bridge | TVL | Net Inflow (30d) |
| Restaking | Restaked TVL | AVS Revenue (30d) |
| RWA | RWA TVL | Revenue (30d) |
| DEX | TVL | Trading Volume (30d) |
| Perps | Open Interest | Perps Volume (30d) |
| Stablecoin Apps | Stablecoin MCap | App Revenue (30d) |

### Dashboard Features

- **Card-Based Layout**: Quickly scan protocols with all essential information at a glance
- **Ethos Integration**: See social credibility scores alongside onchain metrics
- **Smart Filtering**: Filter by category, chain, Ethos score range, and more
- **Flexible Sorting**: Sort by Ethos score, stock value, flow value, or name
- **Detailed Views**: Click any protocol for in-depth analysis and historical data

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fipcryptoX/Protocol-Provenance.git
cd Protocol-Provenance
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts (for future historical data visualization)

## Data Sources

### Ethos API
- Protocol reputation scores
- Review counts and sentiment
- Documentation: https://developers.ethos.network/llms-full.txt

### DefiLlama API
- TVL (current + historical)
- Revenue / fees
- Volume (DEX, perps)
- Open Interest (perps)
- Stablecoin market cap
- Documentation: https://api-docs.defillama.com/llms.txt

## Project Structure

```
Protocol-Provenance/
├── app/                      # Next.js app router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main dashboard
│   └── protocol/[id]/       # Protocol detail pages
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components (sidebar, header)
│   ├── protocol-card.tsx    # Protocol card component
│   └── filters.tsx          # Filter and sort controls
├── lib/                     # Utility functions and API clients
│   ├── api/                 # API integration
│   │   ├── ethos.ts        # Ethos API client
│   │   └── defillama.ts    # DefiLlama API client
│   ├── utils.ts            # Utility functions
│   └── mock-data.ts        # Mock data for testing
├── types/                   # TypeScript type definitions
│   └── index.ts
└── public/                  # Static assets
```

## Design Philosophy

### What This Dashboard Is

- A **sensemaking tool**, not a trading tool
- Focused on **reputable protocols**
- Built on **stock-flow discipline**
- Strengthened by **social credibility (Ethos)**

### What This Dashboard Is Not

- Not a prediction tool
- Not investment advice
- Not a gamified ranking system

### Success Criteria

The product is successful if users say:

- "This helps me decide what projects to look into."
- "I spotted something I would've missed."
- "This makes narratives easier to sanity-check."

## Color Scheme

- Cream: `#FFFCF2`
- Sand: `#CCC5B9`
- Charcoal: `#403D39`
- Dark: `#252422`
- Orange: `#EB5E28`
- Blue (Primary): `#2563EB`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Integrate live Ethos API
- [ ] Integrate live DefiLlama API
- [ ] Add historical charts for stock/flow metrics
- [ ] Implement advanced filtering
- [ ] Add export functionality
- [ ] Multi-chain aggregation views
- [ ] Protocol comparison tool
- [ ] User-saved watchlists

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This dashboard currently uses mock data for demonstration purposes. Full API integration with Ethos and DefiLlama is planned for future releases.
