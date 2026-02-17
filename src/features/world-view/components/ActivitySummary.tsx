import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Clock, Target, TrendingUp, TrendingDown, Calendar, Zap, Settings2, BarChart2 } from 'lucide-react'
import type { World, Task } from '@/types'
import { useState, useMemo, memo } from 'react'

interface ActivitySummaryProps {
  world: World
  tasks: Task[]
}

type ViewMode = 'default' | 'detailed' | 'compact'

const ActivitySummary = memo(({ world, tasks }: ActivitySummaryProps) => {
  const shouldReduceMotion = useReducedMotion()
  const [viewMode, setViewMode] = useState<ViewMode>('default')
  const [showSettings, setShowSettings] = useState(false)

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === 'completed')
    const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
    const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed')
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedToday = completedTasks.filter(t => {
      if (!t.completedAt) return false
      const completedDate = new Date(t.completedAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    }).length

    const avgTimePerTask = completedTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0) / (completedTasks.length || 1)

    return {
      completed: completedTasks.length,
      pending: pendingTasks.length,
      urgent: urgentTasks.length,
      total: tasks.length,
      completionRate,
      completedToday,
      avgTimePerTask: Math.round(avgTimePerTask),
      productivity: completionRate >= 70 ? 'high' : completionRate >= 40 ? 'medium' : 'low'
    }
  }, [tasks])

  const statItems = [
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20',
      borderColor: 'border-emerald-400/30',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/20',
      borderColor: 'border-amber-400/30',
    },
    {
      label: 'Total',
      value: stats.total,
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/20',
      borderColor: 'border-cyan-400/30',
    },
    {
      label: 'Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: stats.completionRate >= 70 ? 'text-emerald-400' : stats.completionRate >= 40 ? 'text-amber-400' : 'text-red-400',
      bgColor: stats.completionRate >= 70 ? 'bg-emerald-400/20' : stats.completionRate >= 40 ? 'bg-amber-400/20' : 'bg-red-400/20',
      borderColor: stats.completionRate >= 70 ? 'border-emerald-400/30' : stats.completionRate >= 40 ? 'border-amber-400/30' : 'border-red-400/30',
    },
  ]

  const animationConfig = {
    duration: shouldReduceMotion ? 0.1 : 1.5,
    ease: 'easeOut'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      <div className="relative p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white">Activity</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(prev => 
                prev === 'default' ? 'detailed' : prev === 'detailed' ? 'compact' : 'default'
              )}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Change view mode"
            >
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {viewMode !== 'compact' && (
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-white/10"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={world.colorTheme}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: stats.completionRate / 100 }}
                  transition={animationConfig}
                  style={{
                    strokeDasharray: '352',
                    strokeDashoffset: '0',
                    filter: `drop-shadow(0 0 6px ${world.colorTheme})`,
                  }}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, ...animationConfig }}
                >
                  {stats.completionRate}%
                </motion.span>
                <span className="text-xs text-muted-foreground">Complete</span>
              </div>
            </div>
          </div>
        )}

        <div className={viewMode === 'compact' ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-2 gap-3'}>
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: shouldReduceMotion ? 0.1 : 0.3 }}
              className={`p-3 rounded-xl border ${stat.bgColor} ${stat.borderColor} ${
                viewMode === 'compact' ? 'text-center' : ''
              }`}
              whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
            >
              <div className={`flex ${viewMode === 'compact' ? 'flex-col' : 'items-center gap-2'} mb-1`}>
                <stat.icon className={`w-4 h-4 ${stat.color} ${viewMode === 'compact' ? 'mx-auto mb-1' : ''}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {viewMode === 'detailed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-3 pt-4 border-t border-white/10"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-muted-foreground">Completed Today</span>
              </div>
              <span className="font-medium text-white">{stats.completedToday} tasks</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-muted-foreground">Avg Time/Task</span>
              </div>
              <span className="font-medium text-white">{stats.avgTimePerTask}m</span>
            </div>

            {stats.urgent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-muted-foreground">Urgent Tasks</span>
                </div>
                <span className="font-medium text-red-400">{stats.urgent}</span>
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Today's Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {stats.completedToday} tasks
              </span>
              {stats.completedToday > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </motion.div>
              )}
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.completedToday) * 20, 100)}%` }}
              transition={animationConfig}
              className="h-full rounded-full"
              style={{ 
                backgroundColor: world.colorTheme,
                boxShadow: `0 0 10px ${world.colorTheme}80`
              }}
            />
          </div>
        </div>

        <motion.div
          className="mt-4 p-3 rounded-lg"
          style={{
            background: stats.productivity === 'high' 
              ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(74, 222, 128, 0.05))'
              : stats.productivity === 'medium'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
            border: `1px solid ${
              stats.productivity === 'high' 
                ? 'rgba(74, 222, 128, 0.2)'
                : stats.productivity === 'medium'
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)'
            }`
          }}
        >
          <div className="flex items-center gap-2">
            {stats.productivity === 'high' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-400" />
            )}
            <p className={`text-sm font-medium ${
              stats.productivity === 'high' 
                ? 'text-emerald-400'
                : stats.productivity === 'medium'
                  ? 'text-amber-400'
                  : 'text-red-400'
            }`}>
              {stats.productivity === 'high' && 'Excellent productivity!'}
              {stats.productivity === 'medium' && 'Good progress today'}
              {stats.productivity === 'low' && 'Let\'s boost productivity'}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
})

ActivitySummary.displayName = 'ActivitySummary'

export default ActivitySummary
