import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Settings, Zap, Moon, Sparkles, Target, TrendingUp, Clock, LayoutDashboard, Menu, Globe } from 'lucide-react'
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
import LightLeak from '@/components/ui/LightLeak'
import WorldExitTransition from '@/components/ui/WorldExitTransition'
import { useState, useMemo } from 'react'
import type { NotebookEntry } from '@/types'

export default function WorldView() {
  const { worldId } = useParams<{ worldId: string }>()
  const navigate = useNavigate()
  const { getWorld, getTasksByWorld, updateGodViewState, updateWorld, deleteWorld, worlds } = useWorldStore()
  const world = worldId ? getWorld(worldId) : undefined
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showSectionManager, setShowSectionManager] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWorldMenu, setShowWorldMenu] = useState(false)
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(world?.notebookEntries || [])

  // Animated background particles
  const bgParticles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
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
      {/* Header with enhanced glassmorphism */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10"
        style={{
          background: `linear-gradient(180deg, ${world.colorTheme}15 0%, rgba(10, 10, 20, 0.9) 100%)`,
          boxShadow: `0 4px 30px ${world.colorTheme}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back & World Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToGalaxy}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </button>
              
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                  style={{ 
                    background: `linear-gradient(135deg, ${world.colorTheme}, ${world.colorTheme}80)`,
                    boxShadow: `0 0 30px ${world.colorTheme}50`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${world.colorTheme}30`,
                      `0 0 40px ${world.colorTheme}50`,
                      `0 0 20px ${world.colorTheme}30`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-2xl font-bold text-white">
                    {world.name.charAt(0).toUpperCase()}
                  </span>
                  {/* Orbital ring decoration */}
                  <motion.div
                    className="absolute inset-[-4px] rounded-2xl border-2 border-white/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{ borderRadius: '18px' }}
                  />
                </motion.div>
                <div>
                  <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    {world.name}
                    <Sparkles className="w-4 h-4 text-yellow-400 opacity-70" />
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> {pendingTasks.length} pending
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {completedTasks.length} done
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Energy Indicator */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div 
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                </motion.div>
                <span className="text-sm font-medium text-white">
                  {world.energyUsed}/{world.energyLimit}
                </span>
                {/* Energy bar mini */}
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: world.colorTheme }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(world.energyUsed / world.energyLimit) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Center - Energy Indicator */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div 
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                </motion.div>
                <span className="text-sm font-medium text-white">
                  {world.energyUsed}/{world.energyLimit}
                </span>
                {/* Energy bar mini */}
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: world.colorTheme }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(world.energyUsed / world.energyLimit) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-4">
              {/* Sections/Moons Button */}
              {world.sections && world.sections.length > 0 && (
                <motion.button
                  onClick={() => setShowSectionManager(!showSectionManager)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md"
                  style={{
                    background: showSectionManager 
                      ? `linear-gradient(135deg, ${world.colorTheme}40, ${world.colorTheme}20)`
                      : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Moon className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-medium text-white">
                    {world.sections.length} Sections
                  </span>
                </motion.button>
              )}

              {/* Add Task Button - Enhanced */}
              <motion.button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${world.colorTheme}, ${world.colorTheme}cc)`,
                  boxShadow: `0 4px 20px ${world.colorTheme}40`,
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: `0 6px 30px ${world.colorTheme}60`,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="hidden sm:inline relative z-10">Add Task</span>
              </motion.button>

              {/* Dashboard Button */}
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View Dashboard"
              >
                <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </motion.button>

              {/* Settings */}
              <motion.button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
