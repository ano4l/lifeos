import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Target, TrendingUp, Zap, CheckCircle2, 
  AlertTriangle, Activity
} from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import LightLeak from '@/components/ui/LightLeak'

export default function DashboardView() {
  const navigate = useNavigate()
  const { worlds, tasks } = useWorldStore()

  // Aggregate stats across all worlds
  const stats = useMemo(() => {
    let totalTasks = 0
    let completedTasks = 0
    let pendingTasks = 0
    let urgentTasks = 0
    let totalEnergy = 0
    let usedEnergy = 0
    let todayCompleted = 0

    worlds.forEach(world => {
      const worldTasks = tasks[world.id] || []
      totalTasks += worldTasks.length
      completedTasks += worldTasks.filter(t => t.status === 'completed').length
      pendingTasks += worldTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
      urgentTasks += worldTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
      totalEnergy += world.energyLimit
      usedEnergy += world.energyUsed
      todayCompleted += world.completedToday
    })

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const energyRate = totalEnergy > 0 ? Math.round((usedEnergy / totalEnergy) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      urgentTasks,
      totalEnergy,
      usedEnergy,
      todayCompleted,
      completionRate,
      energyRate,
      worldCount: worlds.length,
    }
  }, [worlds, tasks])

  // Get world summary with task counts
  const worldSummaries = useMemo(() => {
    return worlds.map(world => {
      const worldTasks = tasks[world.id] || []
      const pending = worldTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
      const completed = worldTasks.filter(t => t.status === 'completed').length
      const urgent = worldTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
      
      return {
        ...world,
        pending,
        completed,
        urgent,
        total: worldTasks.length,
      }
    }).sort((a, b) => b.urgent - a.urgent || b.pending - a.pending)
  }, [worlds, tasks])

  // Get recent/urgent tasks across all worlds
  const urgentTasksList = useMemo(() => {
    const allTasks: Array<{ task: any; world: any }> = []
    
    worlds.forEach(world => {
      const worldTasks = tasks[world.id] || []
      worldTasks
        .filter(t => t.priority === 'urgent' && t.status !== 'completed')
        .forEach(task => {
          allTasks.push({ task, world })
        })
    })
    
    return allTasks.slice(0, 5)
  }, [worlds, tasks])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#050510] via-[#0a0a15] to-[#050510]">
      {/* Background effect */}
      <LightLeak 
        intensity="subtle" 
        speed="slow"
        bias="left"
        color="rgba(100, 150, 255, 0.25)"
        accentColor="rgba(150, 100, 255, 0.15)"
      />

      {/* Header - mobile-first */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/8"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.85) 100%)',
        }}
      >
        <div className="px-4 py-3 safe-area-x">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-1 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">Dashboard</h1>
              <p className="text-xs text-white/40">All worlds overview</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 safe-area-x">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Target}
            label="Pending Tasks"
            value={stats.pendingTasks}
            color="#3b82f6"
            delay={0}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completedTasks}
            subtitle={`${stats.completionRate}% rate`}
            color="#10b981"
            delay={0.1}
          />
          <StatCard
            icon={AlertTriangle}
            label="Urgent"
            value={stats.urgentTasks}
            color="#ef4444"
            delay={0.2}
          />
          <StatCard
            icon={Zap}
            label="Energy Used"
            value={`${stats.usedEnergy}/${stats.totalEnergy}`}
            subtitle={`${stats.energyRate}%`}
            color="#f59e0b"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Worlds Summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Worlds Overview
              </h2>
              
              {worldSummaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No worlds created yet</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    Create your first world
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {worldSummaries.map((world, index) => (
                    <motion.button
                      key={world.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      onClick={() => navigate(`/world/${world.id}`)}
                      className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all
                               border border-white/5 hover:border-white/10 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${world.colorTheme}30` }}
                          >
                            <span className="font-bold" style={{ color: world.colorTheme }}>
                              {world.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-white group-hover:text-white/90">
                              {world.name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{world.pending} pending</span>
                              <span>{world.completed} done</span>
                              {world.urgent > 0 && (
                                <span className="text-red-400">{world.urgent} urgent</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="hidden sm:block w-24">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: world.colorTheme }}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: world.total > 0 
                                  ? `${(world.completed / world.total) * 100}%` 
                                  : '0%' 
                              }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right mt-1">
                            {world.total > 0 ? Math.round((world.completed / world.total) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Urgent Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Urgent Tasks
              </h2>
              
              {urgentTasksList.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-50" />
                  No urgent tasks!
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentTasksList.map(({ task, world }) => (
                    <button
                      key={task.id}
                      onClick={() => navigate(`/world/${world.id}`)}
                      className="w-full p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 
                               border border-red-500/20 text-left transition-colors"
                    >
                      <p className="text-sm text-white font-medium truncate">{task.title}</p>
                      <p className="text-xs text-red-300/70 mt-1">
                        in {world.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Today's Progress
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="font-bold text-white">{stats.todayCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Worlds</span>
                  <span className="font-bold text-white">{stats.worldCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Tasks</span>
                  <span className="font-bold text-white">{stats.totalTasks}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string | number
  subtitle?: string
  color: string
  delay: number
}

function StatCard({ icon: Icon, label, value, subtitle, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color }}>{subtitle}</p>
      )}
    </motion.div>
  )
}
