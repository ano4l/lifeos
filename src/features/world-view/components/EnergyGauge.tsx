import { motion, useReducedMotion } from 'framer-motion'
import { Zap, TrendingUp, TrendingDown, Settings2, BarChart3, AlertTriangle } from 'lucide-react'
import { useState, useMemo, memo } from 'react'

interface EnergyGaugeProps {
  used: number
  limit: number
  color: string
}

type DisplayMode = 'bar' | 'circular' | 'minimal'

const EnergyGauge = memo(({ used, limit, color }: EnergyGaugeProps) => {
  const shouldReduceMotion = useReducedMotion()
  const [displayMode, setDisplayMode] = useState<DisplayMode>('bar')
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const stats = useMemo(() => {
    const percentage = Math.min((used / limit) * 100, 100)
    const remaining = limit - used
    const isLow = percentage > 80
    const isCritical = percentage > 95
    const efficiency = percentage > 0 ? Math.round((100 - percentage) * 1.5) : 100
    
    return {
      percentage,
      remaining,
      isLow,
      isCritical,
      efficiency,
      status: isCritical ? 'critical' : isLow ? 'warning' : 'healthy'
    }
  }, [used, limit])

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (stats.percentage / 100) * circumference

  const getStatusColor = () => {
    if (stats.isCritical) return '#ef4444'
    if (stats.isLow) return '#f59e0b'
    return color
  }

  const animationConfig = {
    duration: shouldReduceMotion ? 0.1 : 1,
    ease: 'easeOut'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1, ...animationConfig }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 60px ${color}10`,
      }}
    >
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              `radial-gradient(circle at 30% 30%, ${color}15 0%, transparent 50%)`,
              `radial-gradient(circle at 70% 70%, ${color}15 0%, transparent 50%)`,
              `radial-gradient(circle at 30% 30%, ${color}15 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={!shouldReduceMotion ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className={`w-5 h-5 ${stats.isCritical ? 'text-red-400' : stats.isLow ? 'text-amber-400' : 'text-cyan-400'}`} />
            </motion.div>
            <h3 className="font-display font-semibold text-white">Energy</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisplayMode(prev => 
                prev === 'bar' ? 'circular' : prev === 'circular' ? 'minimal' : 'bar'
              )}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Change display mode"
            >
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className={`text-sm font-medium ${
              stats.isCritical ? 'text-red-400' : stats.isLow ? 'text-amber-400' : 'text-muted-foreground'
            }`}>
              {used}/{limit}
            </span>
          </div>
        </div>

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-xl bg-white/5 space-y-2"
          >
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" checked={showHistory} onChange={(e) => setShowHistory(e.target.checked)} className="rounded" />
              Show usage history
            </label>
          </motion.div>
        )}

        {displayMode === 'bar' && (
          <div className="space-y-4">
            <div className="relative h-4 bg-cosmos-stardust rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={animationConfig}
                className={`absolute inset-y-0 left-0 rounded-full ${
                  stats.isCritical 
                    ? 'bg-gradient-to-r from-red-500 to-red-400' 
                    : stats.isLow 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                }`}
                style={{
                  boxShadow: stats.isCritical 
                    ? '0 0 20px rgba(239, 68, 68, 0.5)' 
                    : stats.isLow 
                      ? '0 0 20px rgba(245, 158, 11, 0.5)'
                      : `0 0 20px ${color}40`,
                }}
              />
              
              <div className="absolute inset-0 flex justify-between px-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-px h-full bg-white/10" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-cosmos-stardust/50">
                <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                <p className={`text-lg font-bold ${
                  stats.isCritical ? 'text-red-400' : stats.isLow ? 'text-amber-400' : 'text-white'
                }`}>
                  {stats.remaining}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-cosmos-stardust/50">
                <p className="text-xs text-muted-foreground mb-1">Usage</p>
                <p className="text-lg font-bold text-white">{Math.round(stats.percentage)}%</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-cosmos-stardust/50">
                <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                <p className="text-lg font-bold text-emerald-400">{stats.efficiency}%</p>
              </div>
            </div>
          </div>
        )}

        {displayMode === 'circular' && (
          <div className="flex justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={getStatusColor()}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={animationConfig}
                  style={{ filter: `drop-shadow(0 0 8px ${getStatusColor()})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{Math.round(stats.percentage)}%</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {stats.remaining} left
                </span>
              </div>
            </div>
          </div>
        )}

        {displayMode === 'minimal' && (
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-2xl font-bold text-white">{stats.remaining}</p>
              <p className="text-xs text-muted-foreground">Energy remaining</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: getStatusColor() }}>{Math.round(stats.percentage)}%</p>
              <p className="text-xs text-muted-foreground">Used</p>
            </div>
          </div>
        )}

        {stats.isLow && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              stats.isCritical ? 'bg-red-500/20' : 'bg-amber-500/20'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${
              stats.isCritical ? 'text-red-400' : 'text-amber-400'
            }`} />
            <p className={`text-sm ${
              stats.isCritical ? 'text-red-400' : 'text-amber-400'
            }`}>
              {stats.isCritical ? 'Energy critical! Take a break.' : 'Energy running low'}
            </p>
          </motion.div>
        )}

        {!stats.isLow && (
          <motion.div 
            className="mt-4 p-3 rounded-xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(74, 222, 128, 0.05))',
              border: '1px solid rgba(74, 222, 128, 0.2)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={!shouldReduceMotion ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-4 h-4 text-green-400" />
            </motion.div>
            <p className="text-sm text-green-400 font-medium">Energy levels optimal</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
})

EnergyGauge.displayName = 'EnergyGauge'

export default EnergyGauge
