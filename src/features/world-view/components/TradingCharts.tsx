import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

interface TradingChartsProps {
  worldColor: string
}

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  data: number[]
}

const TRADING_SYMBOLS = [
  { symbol: 'XAUUSD', name: 'Gold/USD', basePrice: 2650 },
  { symbol: 'NQ', name: 'Nasdaq 100', basePrice: 21500 },
  { symbol: 'US30', name: 'Dow Jones', basePrice: 44800 },
  { symbol: 'BTCUSD', name: 'Bitcoin/USD', basePrice: 105000 },
]

// Generate realistic looking price data
function generatePriceData(basePrice: number, points: number = 50): number[] {
  const data: number[] = []
  let price = basePrice
  const volatility = basePrice * 0.002 // 0.2% volatility
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * volatility * 2
    price = Math.max(price * 0.95, Math.min(price * 1.05, price + change))
    data.push(price)
  }
  return data
}

// Generate market data with realistic values
function generateMarketData(): MarketData[] {
  return TRADING_SYMBOLS.map(({ symbol, name, basePrice }) => {
    const data = generatePriceData(basePrice)
    const currentPrice = data[data.length - 1]
    const previousPrice = data[0]
    const change = currentPrice - previousPrice
    const changePercent = (change / previousPrice) * 100
    
    return {
      symbol,
      name,
      price: currentPrice,
      change,
      changePercent,
      high: Math.max(...data),
      low: Math.min(...data),
      data,
    }
  })
}

// Mini sparkline chart component
function SparklineChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')
  
  const chartColor = isPositive ? '#10b981' : '#ef4444'
  
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={chartColor}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  )
}

// Full chart component with more detail
function FullChart({ data, symbol }: { data: MarketData; symbol: string }) {
  const isPositive = data.changePercent >= 0
  const chartColor = isPositive ? '#10b981' : '#ef4444'
  
  const min = Math.min(...data.data)
  const max = Math.max(...data.data)
  const range = max - min || 1
  
  const points = data.data.map((value, index) => {
    const x = (index / (data.data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 80 - 10
    return `${x},${y}`
  }).join(' ')
  
  return (
    <div className="h-48 relative">
      {/* Price labels */}
      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-muted-foreground py-2">
        <span>{max.toFixed(2)}</span>
        <span>{((max + min) / 2).toFixed(2)}</span>
        <span>{min.toFixed(2)}</span>
      </div>
      
      {/* Chart area */}
      <div className="absolute left-16 right-0 top-0 bottom-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          
          <defs>
            <linearGradient id={`fullgradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <polygon
            fill={`url(#fullgradient-${symbol})`}
            points={`0,100 ${points} 100,100`}
          />
          <polyline
            fill="none"
            stroke={chartColor}
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}

export default function TradingCharts({ worldColor }: TradingChartsProps) {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('XAUUSD')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Initialize and refresh data
  const refreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setMarketData(generateMarketData())
      setLastUpdate(new Date())
      setIsRefreshing(false)
    }, 500)
  }
  
  useEffect(() => {
    refreshData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const selectedData = marketData.find(d => d.symbol === selectedSymbol)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px ${worldColor}10`,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${worldColor}, ${worldColor}80)` }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Market Overview</h3>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <motion.button
          onClick={refreshData}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>
      
      {/* Market Cards Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {marketData.map((data) => {
          const isPositive = data.changePercent >= 0
          const isSelected = data.symbol === selectedSymbol
          
          return (
            <motion.button
              key={data.symbol}
              onClick={() => setSelectedSymbol(data.symbol)}
              className={`p-3 rounded-xl text-left transition-all ${
                isSelected 
                  ? 'ring-2 ring-offset-2 ring-offset-transparent' 
                  : 'hover:bg-white/5'
              }`}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${worldColor}30, ${worldColor}10)` 
                  : 'rgba(255,255,255,0.03)',
                borderColor: isSelected ? worldColor : 'transparent',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-sm">{data.symbol}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="h-8">
                <SparklineChart data={data.data} isPositive={isPositive} />
              </div>
            </motion.button>
          )
        })}
      </div>
      
      {/* Expanded Chart View */}
      {selectedData && (
        <div className="px-4 pb-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-white">{selectedData.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">
                    ${selectedData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`flex items-center gap-1 text-sm ${
                    selectedData.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {selectedData.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedData.changePercent >= 0 ? '+' : ''}{selectedData.change.toFixed(2)} ({selectedData.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>H: ${selectedData.high.toFixed(2)}</div>
                <div>L: ${selectedData.low.toFixed(2)}</div>
              </div>
            </div>
            <FullChart data={selectedData} symbol={selectedData.symbol} />
          </div>
        </div>
      )}
    </motion.div>
  )
}
