import { motion } from 'framer-motion'
import { Settings, Eye, EyeOff, Satellite, Rocket, AlertTriangle } from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import type { World } from '@/types'

interface GodViewHUDProps {
  worlds: World[]
  onWorldSelect: (worldId: string) => void
}

export default function GodViewHUD({ worlds, onWorldSelect }: GodViewHUDProps) {
  const { godViewState, updateGodViewState, criticalUpdates } = useWorldStore()

  const unreadUpdates = criticalUpdates.filter((u) => !u.isRead)
  const rockets = unreadUpdates.filter((u) => u.type === 'rocket')
  const satellites = unreadUpdates.filter((u) => u.type === 'satellite')

  return (
    <>
      {/* Top Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40 p-4"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmos-energy to-cosmos-glow 
                          flex items-center justify-center">
              <span className="font-display font-bold text-white text-lg">L</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-white text-lg">LifeOS</h1>
              <p className="text-muted-foreground text-xs">God View</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="glass-panel px-4 py-2 flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white">{worlds.length}</p>
                <p className="text-xs text-muted-foreground">Worlds</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-cosmos-energy">
                  {worlds.reduce((acc, w) => acc + (w.taskCount || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-cosmos-warning">
                  {worlds.reduce((acc, w) => acc + (w.urgentTaskCount || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {unreadUpdates.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="glass-panel px-3 py-2 flex items-center gap-2"
              >
                {rockets.length > 0 && (
                  <div className="flex items-center gap-1 text-cosmos-danger">
                    <Rocket className="w-4 h-4" />
                    <span className="text-sm font-medium">{rockets.length}</span>
                  </div>
                )}
                {satellites.length > 0 && (
                  <div className="flex items-center gap-1 text-cosmos-warning">
                    <Satellite className="w-4 h-4" />
                    <span className="text-sm font-medium">{satellites.length}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Toggle Satellites */}
            <button
              onClick={() => updateGodViewState({ showSatellites: !godViewState.showSatellites })}
              className="glass-button p-2"
              title={godViewState.showSatellites ? 'Hide satellites' : 'Show satellites'}
            >
              {godViewState.showSatellites ? (
                <Eye className="w-5 h-5 text-white" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Toggle Conflicts */}
            <button
              onClick={() => updateGodViewState({ showConflicts: !godViewState.showConflicts })}
              className={`glass-button p-2 ${godViewState.showConflicts ? 'text-cosmos-warning' : ''}`}
              title={godViewState.showConflicts ? 'Hide conflicts' : 'Show conflicts'}
            >
              <AlertTriangle className="w-5 h-5" />
            </button>

            {/* Settings */}
            <button className="glass-button p-2">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* World List Sidebar (collapsed by default on mobile) */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block"
      >
        <div className="glass-panel p-2 space-y-2">
          {worlds.map((world) => (
            <motion.button
              key={world.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onWorldSelect(world.id)}
              className="w-12 h-12 rounded-xl flex items-center justify-center
                       transition-all duration-200 relative group"
              style={{ backgroundColor: `${world.colorTheme}30` }}
            >
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: world.colorTheme }}
              />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg
                            bg-cosmos-nebula border border-white/10
                            opacity-0 group-hover:opacity-100 pointer-events-none
                            transition-opacity whitespace-nowrap">
                <p className="text-sm font-medium text-white">{world.name}</p>
                <p className="text-xs text-muted-foreground">
                  {world.taskCount || 0} tasks
                </p>
              </div>

              {/* Urgent indicator */}
              {world.urgentTaskCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full
                              bg-cosmos-danger text-white text-xs font-bold
                              flex items-center justify-center animate-pulse">
                  {world.urgentTaskCount}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Bottom Info Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="glass-panel px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-cosmos-success animate-pulse" />
            <span>System Active</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <p className="text-sm text-muted-foreground">
            Click a planet to enter • Scroll to zoom • Drag to rotate
          </p>
        </div>
      </motion.div>
    </>
  )
}
