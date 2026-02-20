import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Plus, X, ChevronDown, ChevronUp,
  DollarSign, BarChart3, Coins, LineChart, RefreshCw
} from 'lucide-react'
import { fetchPrice, generateHistoricalData } from '@/lib/financeApi'

interface FinanceWidgetsProps {
  worldColor: string
}

interface WidgetData {
  id: string
  symbol: string
  name: string
  category: 'trading' | 'investment'
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  data: number[]
  isEnabled: boolean
}

// Available trading pairs and investments
const AVAILABLE_INSTRUMENTS = {
  trading: [
    { symbol: 'NQ', name: 'Nasdaq 100 Futures', basePrice: 21500 },
    { symbol: 'XAUUSD', name: 'Gold/USD', basePrice: 2650 },
    { symbol: 'BTCUSD', name: 'Bitcoin/USD', basePrice: 105000 },
    { symbol: 'US30', name: 'Dow Jones Futures', basePrice: 44800 },
  ],
  investment: [
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', basePrice: 545 },
    { symbol: 'SPYG', name: 'SPDR S&P 500 Growth ETF', basePrice: 82 },
    { symbol: 'QQQM', name: 'Invesco Nasdaq 100 ETF', basePrice: 215 },
  ],
}

// Create widget data from API response
function createWidgetData(
  symbol: string,
  name: string,
  category: 'trading' | 'investment',
  price: number,
  change: number,
  changePercent: number,
  high: number,
  low: number
): WidgetData {
  return {
    id: symbol,
    symbol,
    name,
    category,
    price,
    change,
    changePercent,
    high,
    low,
    data: generateHistoricalData(price, 30),
    isEnabled: true,
  }
}

// Sparkline chart component
function Sparkline({ data, isPositive, height = 40 }: { data: number[]; isPositive: boolean; height?: number }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')
  
  const color = isPositive ? '#10b981' : '#ef4444'
  
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={`sparkline-gradient-${isPositive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#sparkline-gradient-${isPositive ? 'up' : 'down'})`}
        points={`0,100 ${points} 100,100`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// Expanded chart component
function ExpandedChart({ data, symbol, isPositive }: { data: WidgetData; symbol: string; isPositive: boolean }) {
  const color = isPositive ? '#10b981' : '#ef4444'
  const min = Math.min(...data.data)
  const max = Math.max(...data.data)
  const range = max - min || 1
  
  const points = data.data.map((value, index) => {
    const x = (index / (data.data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 80 - 10
    return `${x},${y}`
  }).join(' ')
  
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="pt-3 pb-2 border-t border-white/10 mt-3">
        {/* Price labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>H: ${data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span>L: ${data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        {/* Chart */}
        <div className="h-32 relative">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            
            <defs>
              <linearGradient id={`expanded-gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            
            <polygon
              fill={`url(#expanded-gradient-${symbol})`}
              points={`0,100 ${points} 100,100`}
            />
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        
        {/* Time labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1D ago</span>
          <span>12H</span>
          <span>Now</span>
        </div>
      </div>
    </motion.div>
  )
}

// Individual widget card
function WidgetCard({ 
  widget, 
  worldColor: _worldColor, 
  onRemove 
}: { 
  widget: WidgetData
  worldColor: string
  onRemove: () => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isPositive = widget.changePercent >= 0
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="rounded-xl p-3 relative group min-w-0"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 
                 hover:bg-red-500/20 transition-all"
      >
        <X className="w-3.5 h-3.5 text-red-400" />
      </button>
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white text-sm">{widget.symbol}</span>
            <span className={`text-[10px] px-1 py-0.5 rounded shrink-0 ${
              widget.category === 'trading' 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              {widget.category === 'trading' ? 'Trading' : 'Investment'}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{widget.name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-white text-sm">
            ${widget.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className={`flex items-center justify-end gap-0.5 text-[10px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            <span>{isPositive ? '+' : ''}{widget.changePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      {/* Mini chart */}
      <div className="h-10 mb-2">
        <Sparkline data={widget.data} isPositive={isPositive} />
      </div>
      
      {/* Expand button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground 
                 hover:text-white transition-colors py-1"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            <span>Less</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            <span>More</span>
          </>
        )}
      </button>
      
      {/* Expanded chart */}
      <AnimatePresence>
        {isExpanded && (
          <ExpandedChart data={widget} symbol={widget.symbol} isPositive={isPositive} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Add widget modal
function AddWidgetModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  enabledSymbols,
  worldColor 
}: { 
  isOpen: boolean
  onClose: () => void
  onAdd: (symbol: string, category: 'trading' | 'investment') => void
  enabledSymbols: string[]
  worldColor: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md h-fit max-h-[80vh] z-50 
                     rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(10, 10, 20, 0.99))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px ${worldColor}20`,
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Add Widget</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Trading Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <h4 className="font-medium text-white text-sm">Trading Pairs</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_INSTRUMENTS.trading.map((instrument) => {
                    const isEnabled = enabledSymbols.includes(instrument.symbol)
                    return (
                      <button
                        key={instrument.symbol}
                        onClick={() => !isEnabled && onAdd(instrument.symbol, 'trading')}
                        disabled={isEnabled}
                        className={`p-3 rounded-xl text-left transition-all ${
                          isEnabled 
                            ? 'bg-white/5 opacity-50 cursor-not-allowed' 
                            : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20'
                        }`}
                      >
                        <p className="font-medium text-white text-sm">{instrument.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{instrument.name}</p>
                        {isEnabled && (
                          <p className="text-xs text-emerald-400 mt-1">Added</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Investment Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-4 h-4 text-purple-400" />
                  <h4 className="font-medium text-white text-sm">Investment ETFs</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_INSTRUMENTS.investment.map((instrument) => {
                    const isEnabled = enabledSymbols.includes(instrument.symbol)
                    return (
                      <button
                        key={instrument.symbol}
                        onClick={() => !isEnabled && onAdd(instrument.symbol, 'investment')}
                        disabled={isEnabled}
                        className={`p-3 rounded-xl text-left transition-all ${
                          isEnabled 
                            ? 'bg-white/5 opacity-50 cursor-not-allowed' 
                            : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20'
                        }`}
                      >
                        <p className="font-medium text-white text-sm">{instrument.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{instrument.name}</p>
                        {isEnabled && (
                          <p className="text-xs text-emerald-400 mt-1">Added</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function FinanceWidgets({ worldColor }: FinanceWidgetsProps) {
  const [widgets, setWidgets] = useState<WidgetData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  // Fetch real prices for a widget
  const fetchWidgetData = useCallback(async (
    symbol: string,
    name: string,
    category: 'trading' | 'investment'
  ): Promise<WidgetData> => {
    try {
      const priceData = await fetchPrice(symbol)
      return createWidgetData(
        symbol,
        name,
        category,
        priceData.price,
        priceData.change,
        priceData.changePercent,
        priceData.high,
        priceData.low
      )
    } catch (error) {
      // Fallback to instrument base price
      const instrument = [...AVAILABLE_INSTRUMENTS.trading, ...AVAILABLE_INSTRUMENTS.investment]
        .find(i => i.symbol === symbol)
      const basePrice = instrument?.basePrice || 100
      return createWidgetData(symbol, name, category, basePrice, 0, 0, basePrice, basePrice)
    }
  }, [])

  // Initialize with default widgets
  useEffect(() => {
    const initWidgets = async () => {
      setIsLoading(true)
      const defaultWidgets = await Promise.all([
        fetchWidgetData('NQ', 'Nasdaq 100 Futures', 'trading'),
        fetchWidgetData('XAUUSD', 'Gold/USD', 'trading'),
        fetchWidgetData('VOO', 'Vanguard S&P 500 ETF', 'investment'),
      ])
      setWidgets(defaultWidgets)
      setLastUpdate(new Date())
      setIsLoading(false)
    }
    initWidgets()
  }, [fetchWidgetData])

  // Auto-refresh data every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedWidgets = await Promise.all(
        widgets.map(widget => fetchWidgetData(widget.symbol, widget.name, widget.category))
      )
      setWidgets(updatedWidgets)
      setLastUpdate(new Date())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [widgets, fetchWidgetData])

  // Manual refresh
  const handleRefresh = async () => {
    setIsLoading(true)
    const updatedWidgets = await Promise.all(
      widgets.map(widget => fetchWidgetData(widget.symbol, widget.name, widget.category))
    )
    setWidgets(updatedWidgets)
    setLastUpdate(new Date())
    setIsLoading(false)
  }

  const handleAddWidget = async (symbol: string, category: 'trading' | 'investment') => {
    const instruments = category === 'trading' 
      ? AVAILABLE_INSTRUMENTS.trading 
      : AVAILABLE_INSTRUMENTS.investment
    const instrument = instruments.find(i => i.symbol === symbol)
    if (!instrument) return
    
    const newWidget = await fetchWidgetData(symbol, instrument.name, category)
    setWidgets(prev => [...prev, newWidget])
    setShowAddModal(false)
  }

  const handleRemoveWidget = (symbol: string) => {
    setWidgets(prev => prev.filter(w => w.symbol !== symbol))
  }

  const tradingWidgets = widgets.filter(w => w.category === 'trading')
  const investmentWidgets = widgets.filter(w => w.category === 'investment')
  const enabledSymbols = widgets.map(w => w.symbol)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${worldColor}, ${worldColor}80)` }}
          >
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Finance Dashboard</h2>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Updating...' : `Updated: ${lastUpdate.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 
                     transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: worldColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </motion.button>
        </div>
      </div>

      {/* Trading Widgets */}
      {tradingWidgets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Trading</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <AnimatePresence>
              {tradingWidgets.map((widget) => (
                <WidgetCard
                  key={widget.symbol}
                  widget={widget}
                  worldColor={worldColor}
                  onRemove={() => handleRemoveWidget(widget.symbol)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Investment Widgets */}
      {investmentWidgets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium text-white">Investments</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <AnimatePresence>
              {investmentWidgets.map((widget) => (
                <WidgetCard
                  key={widget.symbol}
                  widget={widget}
                  worldColor={worldColor}
                  onRemove={() => handleRemoveWidget(widget.symbol)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {widgets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No widgets added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: worldColor }}
          >
            Add Your First Widget
          </button>
        </motion.div>
      )}

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddWidget}
        enabledSymbols={enabledSymbols}
        worldColor={worldColor}
      />
    </motion.div>
  )
}
