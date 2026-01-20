# Icon Fetching Flow Documentation

## 🔄 Complete Icon Flow

### **For Protocols:**

```
1. API Call
   ├─ URL: https://api.llama.fi/protocols
   ├─ File: lib/api/defillama-registry.ts:81
   └─ Returns: Array of protocols with `logo` field

2. Data Enrichment
   ├─ File: lib/dynamic-protocol-data.ts:68
   ├─ Gets logo from: protocol.logo (from API response)
   └─ No override system (uses API logo directly)

3. Card Rendering
   ├─ File: app/page.tsx (via /api/protocols route)
   ├─ Passes to: components/ui/asset-card.tsx
   └─ Renders: <img src={avatarUrl} />
```

**Protocol Logo Example:**
```json
{
  "name": "Aave",
  "slug": "aave",
  "logo": "https://icons.llama.fi/aave.png"
}
```

---

### **For Chains:**

```
1. API Call
   ├─ URL: https://api.llama.fi/chains
   ├─ File: lib/api/defillama-chains.ts:75
   └─ Returns: Array of chains with `logo` field (often null or empty)

2. Logo Override System
   ├─ File: lib/dynamic-chain-data.ts:59
   ├─ Function: getCorrectChainLogo(chainName, fallbackLogo)
   └─ Priority:
       1. Check CHAIN_LOGO_OVERRIDES[chainName] (lib/chain-logo-overrides.ts:12)
       2. If override exists → return override URL
       3. If API provided logo → return API logo
       4. Otherwise → generate URL: https://defillama.com/chain-icons/rsz_{chainname}.jpg

3. Card Rendering
   ├─ File: app/page.tsx (via /api/chains route)
   ├─ Passes to: components/ui/asset-card.tsx
   └─ Renders: <img src={avatarUrl} onError={showFallback} />
```

**Chain Logo Flow for Base:**
```javascript
// Step 1: API returns (hypothetical)
{
  "name": "Base",
  "logo": null  // or empty string
}

// Step 2: getCorrectChainLogo("Base", null) is called

// Step 3: Check CHAIN_LOGO_OVERRIDES
CHAIN_LOGO_OVERRIDES = {
  "base": "https://defillama.com/chain-icons/rsz_base.jpg"
}

// Step 4: Returns override URL
→ "https://defillama.com/chain-icons/rsz_base.jpg"
```

---

## 📍 Key Files

| File | Purpose |
|------|---------|
| `lib/api/defillama-registry.ts` | Fetches protocol data from `/protocols` endpoint |
| `lib/api/defillama-chains.ts` | Fetches chain data from `/chains` endpoint |
| `lib/dynamic-protocol-data.ts` | Enriches protocol data (uses API logo directly) |
| `lib/dynamic-chain-data.ts` | Enriches chain data (line 59: applies logo override) |
| `lib/chain-logo-overrides.ts` | Override mapping for chain logos |
| `components/ui/asset-card.tsx` | Renders the logo with error handling |

---

## 🔍 Current Base Logo Configuration

**File:** `/lib/chain-logo-overrides.ts:15`
```typescript
"base": "https://coin-images.coingecko.com/asset_platforms/images/131/large/base.png"
```

**What happens:**
1. DefiLlama API returns Base chain with `logo: null` or `logo: ""`
2. `getCorrectChainLogo("Base", null)` is called
3. Normalizes to lowercase: `"base"`
4. Finds override: `CHAIN_LOGO_OVERRIDES["base"]`
5. Returns: `"https://coin-images.coingecko.com/asset_platforms/images/131/large/base.png"`
6. Console logs: `Using override logo for Base: https://coin-images.coingecko.com/asset_platforms/images/131/large/base.png`

---

## 🐛 Debugging Steps

### 1. Check what DefiLlama API actually returns:
```bash
curl -s "https://api.llama.fi/chains" | jq '.[] | select(.name == "Base")'
```

### 2. Check if override is being applied:
Look for console log:
```
Using override logo for Base: [URL]
```

### 3. Check if image loads:
Look for console warning:
```
Failed to load logo for Base: [URL]
```

### 4. Test URL directly:
Open the URL in your browser to see the actual error (403, 404, CORS, etc.)

---

## ✅ Alternative Logo Sources

If current URL fails, try these alternatives in `lib/chain-logo-overrides.ts:15`:

```typescript
// Option 1: DefiLlama protocol logo (if Base has a protocol entry)
"base": "https://icons.llama.fi/base.png"

// Option 2: CoinGecko (different ID)
"base": "https://coin-images.coingecko.com/coins/images/27118/large/coinbase-wrapped-staked-eth.png"

// Option 3: Direct from blockchain
"base": "https://avatars.githubusercontent.com/u/108554348?s=200&v=4"

// Option 4: Simple Icons CDN
"base": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/base.svg"

// Option 5: Data URI (always works)
"base": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%230052FF' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E"
```

---

## 🔄 Why Chains Need Overrides but Protocols Don't

**Protocols:**
- DefiLlama `/protocols` endpoint provides high-quality logos for all protocols
- Stored in DefiLlama's CDN: `https://icons.llama.fi/{protocol-name}.png`
- No override needed ✅

**Chains:**
- DefiLlama `/chains` endpoint often returns `logo: null` for many chains
- Chain logos aren't as standardized in their API
- Override system fills the gaps with curated URLs 🎨
