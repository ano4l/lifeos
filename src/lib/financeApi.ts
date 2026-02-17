// Finance API service for fetching real market data
// Uses Twelve Data API for real-time prices, CoinGecko as crypto fallback

interface PriceData {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  timestamp: number
}

// Twelve Data API symbol mappings
const TWELVE_DATA_SYMBOLS: Record<string, string> = {
  'NQ': 'NQ1',      // Nasdaq Futures
  'US30': 'YM=F',    // Dow Futures  
  'XAUUSD': 'XAU/USD', // Gold/USD
  'VOO': 'VOO',      // Vanguard S&P 500
  'SPYG': 'SPYG',    // SPDR Growth
  'QQQM': 'QQQM',    // Invesco Nasdaq
  'BTCUSD': 'BTC/USD', // Bitcoin/USD
}

// CoinGecko crypto symbols (fallback)
const CRYPTO_SYMBOLS: Record<string, string> = {
  'BTCUSD': 'bitcoin',
}

// Fallback prices if API fails
const FALLBACK_PRICES: Record<string, number> = {
  'NQ': 21500,
  'XAUUSD': 2650,
  'BTCUSD': 105000,
  'US30': 44800,
  'VOO': 545,
  'SPYG': 82,
  'QQQM': 215,
}

// Cache for API responses
const priceCache: Map<string, { data: PriceData; timestamp: number }> = new Map()
const CACHE_DURATION = 60000 // 1 minute cache

// Fetch crypto prices from CoinGecko (free, no API key needed)
async function fetchCryptoPrice(symbol: string): Promise<PriceData | null> {
  const coinId = CRYPTO_SYMBOLS[symbol]
  if (!coinId) return null

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true`
    )
    
    if (!response.ok) throw new Error('CoinGecko API error')
    
    const data = await response.json()
    const coinData = data[coinId]
    
    if (!coinData) return null
    
    const price = coinData.usd
    const changePercent = coinData.usd_24h_change || 0
    const change = (price * changePercent) / 100
    
    return {
      symbol,
      price,
      change,
      changePercent,
      high: coinData.usd_24h_high || price * 1.02,
      low: coinData.usd_24h_low || price * 0.98,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.warn(`Failed to fetch ${symbol} from CoinGecko:`, error)
    return null
  }
}

// Fetch prices from Twelve Data API
async function fetchTwelveDataPrice(symbol: string): Promise<PriceData | null> {
  const twelveSymbol = TWELVE_DATA_SYMBOLS[symbol]
  if (!twelveSymbol) return null

  try {
    const apiKey = '2dc7b4b2700940dd90564a968b710480'
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${twelveSymbol}&interval=1min&apikey=${apiKey}`
    )
    
    if (!response.ok) throw new Error('Twelve Data API error')
    
    const data = await response.json()
    const values = data.values?.[0]
    
    if (!values) return null
    
    const price = parseFloat(values.close)
    const previousClose = parseFloat(values.prev_close || values.close)
    const change = price - previousClose
    const changePercent = (change / previousClose) * 100
    
    return {
      symbol,
      price,
      change,
      changePercent,
      high: parseFloat(values.high),
      low: parseFloat(values.low),
      timestamp: Date.now(),
    }
  } catch (error) {
    console.warn(`Failed to fetch ${symbol} from Twelve Data:`, error)
    return null
  }
}

// Generate simulated price with realistic movement
function generateSimulatedPrice(symbol: string, basePrice?: number): PriceData {
  const base = basePrice || FALLBACK_PRICES[symbol] || 100
  const volatility = base * 0.002 // 0.2% volatility
  const change = (Math.random() - 0.5) * volatility * 4
  const changePercent = (change / base) * 100
  
  return {
    symbol,
    price: base + change,
    change,
    changePercent,
    high: base + Math.abs(change) * 1.5,
    low: base - Math.abs(change) * 1.5,
    timestamp: Date.now(),
  }
}

// Main function to fetch price for any symbol
export async function fetchPrice(symbol: string): Promise<PriceData> {
  // Check cache first
  const cached = priceCache.get(symbol)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  let priceData: PriceData | null = null

  // Try Twelve Data API first (real-time data)
  if (TWELVE_DATA_SYMBOLS[symbol]) {
    priceData = await fetchTwelveDataPrice(symbol)
  }
  
  // Try crypto API as fallback
  if (!priceData && CRYPTO_SYMBOLS[symbol]) {
    priceData = await fetchCryptoPrice(symbol)
  }

  // Fallback to simulated data
  if (!priceData) {
    priceData = generateSimulatedPrice(symbol)
  }

  // Cache the result
  priceCache.set(symbol, { data: priceData, timestamp: Date.now() })

  return priceData
}

// Fetch multiple prices at once
export async function fetchPrices(symbols: string[]): Promise<Map<string, PriceData>> {
  const results = new Map<string, PriceData>()
  
  // Fetch all prices in parallel
  const promises = symbols.map(async (symbol) => {
    const data = await fetchPrice(symbol)
    results.set(symbol, data)
  })
  
  await Promise.all(promises)
  return results
}

// Generate historical data for charts (simulated based on current price)
export function generateHistoricalData(currentPrice: number, points: number = 30): number[] {
  const data: number[] = []
  let price = currentPrice * (0.98 + Math.random() * 0.04) // Start slightly different
  const volatility = currentPrice * 0.002
  
  for (let i = 0; i < points - 1; i++) {
    const change = (Math.random() - 0.5) * volatility * 2
    price = Math.max(price * 0.95, Math.min(price * 1.05, price + change))
    data.push(price)
  }
  
  // End at current price
  data.push(currentPrice)
  return data
}
