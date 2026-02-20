import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Settings, LayoutDashboard, Globe, Moon } from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import TaskList from './components/TaskList'
import Timeline from './components/Timeline'
import EnergyGauge from './components/EnergyGauge'
import ActivitySummary from './components/ActivitySummary'
import QuickAddTask from './components/QuickAddTask'
import FinanceWidgets from './components/FinanceWidgets'
import WorldWidgets from './components/WorldWidgets'
import Notebook from './components/Notebook'
import WorldSettings from './components/WorldSettings'
import CreateMoonModal from './components/CreateMoonModal'
import LightLeak from '@/components/ui/LightLeak'
import WorldExitTransition from '@/components/ui/WorldExitTransition'
import { useState, useMemo } from 'react'
import type { NotebookEntry } from '@/types'

export default function WorldView() {
  const { worldId } = useParams<{ worldId: string }>()
  const navigate = useNavigate()
  const { getWorld, getTasksByWorld, getMoonsByWorld, moonTasks, updateGodViewState, updateWorld, deleteWorld, worlds } = useWorldStore()
  const world = worldId ? getWorld(worldId) : undefined
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [_activeSection, _setActiveSection] = useState<string | null>(null)
  const [_showSectionManager, _setShowSectionManager] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWorldMenu, setShowWorldMenu] = useState(false)
  const [showCreateMoon, setShowCreateMoon] = useState(false)
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(world?.notebookEntries || [])

  // Animated background particles - reduced count for mobile perf
  const bgParticles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 8,
    }))
  }, [])
  const tasks = worldId ? getTasksByWorld(worldId) : []

  if (!world) {
    return (
      <div className="min-h-screen bg-cosmos-void flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            World Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            This world doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-cosmos-energy text-white font-medium"
          >
            Return to Galaxy
          </button>
        </div>
      </div>
    )
  }

  const [isExiting, setIsExiting] = useState(false)

  const handleBackToGalaxy = () => {
    updateGodViewState({ isTransitioning: true, selectedWorldId: null })
    setIsExiting(true)
  }

  const handleExitComplete = () => {
    navigate('/')
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed')

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${world.colorTheme}15 0%, #050510 40%, #0a0a15 60%, ${world.colorTheme}08 100%)`,
      }}
    >
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {bgParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: world.colorTheme,
              opacity: 0.1,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* x.ai-style cinematic light leak effect */}
      <LightLeak 
        intensity="subtle" 
        speed="slow"
        bias="right"
        color={`${world.colorTheme}40`}
        accentColor="rgba(150, 200, 255, 0.15)"
      />

      {/* Glassmorphism overlay gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${world.colorTheme}15 0%, transparent 50%)`,
        }}
      />
      {/* Header - mobile-first, clean */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/8"
        style={{
          background: `linear-gradient(180deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.85) 100%)`,
        }}
      >
        <div className="px-4 py-3 safe-area-x">
          <div className="flex items-center justify-between gap-2">
            {/* Left - Back & World Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={handleBackToGalaxy}
                className="p-2 -ml-1 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </button>
              
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${world.colorTheme}, ${world.colorTheme}80)`,
                }}
              >
                <span className="text-lg font-bold text-white">
                  {world.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-white truncate">{world.name}</h1>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>{pendingTasks.length} pending</span>
                  <span>&middot;</span>
                  <span>{completedTasks.length} done</span>
                </div>
              </div>
            </div>

            {/* Right - Compact actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Add Task */}
              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium active:scale-95 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${world.colorTheme}, ${world.colorTheme}cc)`,
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Task</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                <Settings className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 safe-area-x">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Urgent Tasks Alert */}
            {urgentTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-cosmos-danger/20 border border-cosmos-danger/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cosmos-danger/30 flex items-center justify-center">
                    <span className="text-cosmos-danger font-bold">{urgentTasks.length}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Urgent Tasks</p>
                    <p className="text-sm text-cosmos-danger/80">
                      {urgentTasks.map((t) => t.title).join(', ')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Task List */}
            <TaskList
              worldId={world.id}
              tasks={tasks}
              worldColor={world.colorTheme}
            />

            {/* World-specific Widgets Dashboard (below tasks) */}
            {world.worldType === 'finance' && (
              <FinanceWidgets worldColor={world.colorTheme} />
            )}
            {world.worldType && world.worldType !== 'finance' && world.worldType !== 'general' && (
              <WorldWidgets worldType={world.worldType} worldColor={world.colorTheme} />
            )}

            {/* Moons Section */}
            {worldId && (() => {
              const moons = getMoonsByWorld(worldId)
              return (
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Moon className="w-4 h-4 text-white/50" />
                      Moons
                      {moons.length > 0 && (
                        <span className="text-xs text-white/30 font-normal">({moons.length})</span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowCreateMoon(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {moons.length === 0 ? (
                    <div className="text-center py-6">
                      <Moon className="w-8 h-8 text-white/10 mx-auto mb-2" />
                      <p className="text-xs text-white/25">No moons yet</p>
                      <p className="text-xs text-white/15 mt-1">Moons are sub-worlds for focused areas</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {moons.map((m) => {
                        const mTasks = moonTasks[m.id] || []
                        const mPending = mTasks.filter(t => t.status !== 'completed').length
                        const mCompleted = mTasks.filter(t => t.status === 'completed').length
                        const mTotal = mTasks.length

                        return (
                          <button
                            key={m.id}
                            onClick={() => navigate(`/world/${worldId}/moon/${m.id}`)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-all text-left group"
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${m.colorTheme}, ${m.colorTheme}80)` }}
                            >
                              <span className="text-xs font-bold text-white">
                                {m.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{m.name}</p>
                              <div className="flex items-center gap-2 text-xs text-white/35">
                                <span>{mPending} pending</span>
                                {mCompleted > 0 && <span>&middot; {mCompleted} done</span>}
                              </div>
                            </div>
                            {/* Mini progress */}
                            {mTotal > 0 && (
                              <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    backgroundColor: m.colorTheme,
                                    width: `${Math.round((mCompleted / mTotal) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Right Column - Stats & Timeline */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <ActivitySummary
              world={world}
              tasks={tasks}
            />

            {/* Energy Gauge */}
            <EnergyGauge
              used={world.energyUsed}
              limit={world.energyLimit}
              color={world.colorTheme}
            />

            {/* Timeline */}
            <Timeline
              tasks={tasks}
              worldColor={world.colorTheme}
            />

            {/* Notebook */}
            <Notebook
              worldId={world.id}
              worldColor={world.colorTheme}
              entries={notebookEntries}
              onEntriesChange={setNotebookEntries}
            />
          </div>
        </div>

        </main>

      {/* Quick Add Task Modal */}
      <QuickAddTask
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        worldId={world.id}
        worldColor={world.colorTheme}
      />

      {/* World Menu Dropdown */}
      <AnimatePresence>
        {showWorldMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 z-50 w-64 rounded-2xl backdrop-blur-2xl border border-white/10 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 217, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                All Worlds
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {worlds.map((w) => (
                  <motion.button
                    key={w.id}
                    onClick={() => {
                      navigate(`/world/${w.id}`)
                      setShowWorldMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      w.id === world.id
                        ? 'bg-white/20 border border-white/30'
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${w.colorTheme}30` }}
                    >
                      <span className="text-sm font-bold text-white">
                        {w.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{w.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTasksByWorld(w.id).filter(t => t.status !== 'completed').length} pending
                      </p>
                    </div>
                    {w.id === world.id && (
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    navigate('/')
                    setShowWorldMenu(false)
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Galaxy View</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Moon Modal */}
      {worldId && (
        <CreateMoonModal
          isOpen={showCreateMoon}
          onClose={() => setShowCreateMoon(false)}
          parentWorldId={worldId}
          parentWorldColor={world.colorTheme}
        />
      )}

      {/* World Settings Modal */}
      <WorldSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        world={world}
        onUpdate={(updates) => updateWorld(world.id, updates)}
        onDelete={() => {
          deleteWorld(world.id)
          navigate('/')
        }}
      />

      {/* Exit Transition Animation */}
      <WorldExitTransition
        isActive={isExiting}
        worldColor={world.colorTheme}
        onComplete={handleExitComplete}
      />
    </div>
  )
}
