import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutDashboard, Zap } from 'lucide-react'
import PlanetButton from './components/PlanetButton'
import CreateWorldModal from './components/CreateWorldModal'
import WorldTransition from '@/components/ui/WorldTransition'
import { useWorldStore } from '@/stores/useWorldStore'

export default function GodView() {
  const navigate = useNavigate()
  const { worlds, tasks, moons, updateGodViewState } = useWorldStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [transitionWorld, setTransitionWorld] = useState<{ id: string; name: string; color: string } | null>(null)

  const handleWorldSelect = (worldId: string) => {
    const world = worlds.find(w => w.id === worldId)
    if (!world) return
    updateGodViewState({ selectedWorldId: worldId, isTransitioning: true })
    setTransitionWorld({ id: worldId, name: world.name, color: world.colorTheme })
  }

  const handleTransitionComplete = () => {
    if (transitionWorld) {
      navigate(`/world/${transitionWorld.id}`)
    }
  }

  // Aggregate stats
  const stats = useMemo(() => {
    let totalTasks = 0
    let completedTasks = 0
    let totalEnergy = 0
    let usedEnergy = 0
    worlds.forEach(world => {
      const wt = tasks[world.id] || []
      totalTasks += wt.length
      completedTasks += wt.filter(t => t.status === 'completed').length
      totalEnergy += world.energyLimit
      usedEnergy += world.energyUsed
    })
    return { totalTasks, completedTasks, totalEnergy, usedEnergy, worldCount: worlds.length }
  }, [worlds, tasks])

  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-y-auto overflow-x-hidden"
      style={{ background: '#050508' }}
    >
      {/* Nebula background */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 160% 100% at 30% 80%, rgba(255, 80, 40, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 140% 90% at 75% 20%, rgba(80, 120, 255, 0.14) 0%, transparent 50%),
            radial-gradient(ellipse 120% 70% at 15% 15%, rgba(180, 80, 220, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255, 180, 80, 0.08) 0%, transparent 60%)
          `
        }}
      />

      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70"
        style={{
          background: `
            radial-gradient(1.5px 1.5px at 15px 25px, #fff, transparent),
            radial-gradient(1px 1px at 55px 65px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 95px 35px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.5px 1.5px at 140px 75px, #fff, transparent),
            radial-gradient(1px 1px at 175px 20px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 30px 90px, rgba(255,255,255,0.4), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px'
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/8"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.85) 100%)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 safe-area-x">
          {/* Left - Title */}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">LifeOS</h1>
            <p className="text-xs text-white/40">
              {stats.worldCount} {stats.worldCount === 1 ? 'world' : 'worlds'} &middot; {stats.totalTasks} tasks
            </p>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Energy summary */}
            {stats.totalEnergy > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-white/70">{stats.usedEnergy}/{stats.totalEnergy}</span>
              </div>
            )}

            {/* Dashboard */}
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 transition-colors"
            >
              <LayoutDashboard className="w-4.5 h-4.5 text-white/70" />
            </button>

            {/* Create world */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white text-sm font-medium transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #00d9ff, #6366f1)',
                boxShadow: '0 4px 15px rgba(0,217,255,0.25)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New World</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 safe-area-x pb-8">
        {/* Planet grid */}
        {worlds.length > 0 ? (
          <div className="flex flex-wrap justify-center items-start gap-8 sm:gap-12 md:gap-16 pt-12 sm:pt-16 pb-4">
            {worlds.map((world, index) => {
              const worldTasks = tasks[world.id] || []
              const taskCount = worldTasks.length
              const urgentCount = worldTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
              const moonCount = moons.filter(m => m.parentWorldId === world.id).length

              return (
                <PlanetButton
                  key={world.id}
                  world={world}
                  index={index}
                  onClick={() => handleWorldSelect(world.id)}
                  taskCount={taskCount}
                  urgentCount={urgentCount}
                  moonCount={moonCount}
                />
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Empty planet illustration */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full opacity-20 blur-xl"
                  style={{ background: 'linear-gradient(135deg, #00d9ff, #6366f1)' }}
                />
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white/30" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Welcome to LifeOS</h2>
              <p className="text-white/50 text-sm mb-6 max-w-xs">
                Create your first world to start organizing your life into focused areas
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl text-white font-medium transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #00d9ff, #6366f1)',
                  boxShadow: '0 4px 20px rgba(0,217,255,0.3)',
                }}
              >
                Create Your First World
              </button>
            </motion.div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateWorldModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <WorldTransition
        isActive={!!transitionWorld}
        worldColor={transitionWorld?.color || '#ffffff'}
        worldName={transitionWorld?.name || ''}
        onComplete={handleTransitionComplete}
      />
    </div>
  )
}
