import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Crosshair, Globe, X } from 'lucide-react'
import Galaxy from './components/Galaxy'
import CreateWorldModal from './components/CreateWorldModal'
import WorldTransition from '@/components/ui/WorldTransition'
import { useWorldStore } from '@/stores/useWorldStore'

export default function GodView() {
  const navigate = useNavigate()
  const { worlds, godViewState, updateGodViewState } = useWorldStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const controlsRef = useRef<any>(null)
  const [isCentering, setIsCentering] = useState(false)
  const [transitionWorld, setTransitionWorld] = useState<{ id: string; name: string; color: string } | null>(null)
  const [worldMenuOpen, setWorldMenuOpen] = useState(false)

  const handleCenterPlanets = useCallback(() => {
    if (!controlsRef.current || worlds.length === 0) return
    
    setIsCentering(true)
    
    const controls = controlsRef.current
    
    const animate = () => {
      controls.target.set(0, 0, 0)
      controls.object.position.set(0, 35, 45)
      controls.update()
      setIsCentering(false)
    }
    
    setTimeout(animate, 200)
  }, [worlds])

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

  const handleWorldHover = (worldId: string | null) => {
    updateGodViewState({ hoveredWorldId: worldId })
  }

  
  return (
    <div className="relative w-full h-screen overflow-hidden touch-none"
      style={{
        background: '#000005'
      }}
    >
      {/* Nebula background like reference image */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 200% 120% at 30% 70%, rgba(255, 100, 50, 0.25) 0%, rgba(255, 150, 100, 0.15) 30%, transparent 60%),
            radial-gradient(ellipse 180% 100% at 70% 30%, rgba(100, 150, 255, 0.2) 0%, rgba(150, 200, 255, 0.1) 25%, transparent 55%),
            radial-gradient(ellipse 150% 80% at 20% 20%, rgba(200, 100, 255, 0.18) 0%, rgba(255, 150, 200, 0.08) 35%, transparent 50%)
          `
        }}
      />
      
      {/* Central galaxy glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 50%, rgba(255, 200, 100, 0.15) 0%, rgba(255, 150, 50, 0.08) 40%, transparent 70%)
          `
        }}
      />

      {/* Starfield enhancement */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background: `
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 130px 80px, #fff, transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.7), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px'
        }}
      />

      {/* World Quick Access Menu */}
      <AnimatePresence>
        {worldMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-4 z-50 w-72 rounded-2xl backdrop-blur-2xl border border-white/10 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 217, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Quick Access
                </h3>
                <button
                  onClick={() => setWorldMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {worlds.map((world) => (
                  <motion.button
                    key={world.id}
                    onClick={() => {
                      handleWorldSelect(world.id)
                      setWorldMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/10 border border-transparent"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${world.colorTheme}30` }}
                    >
                      <span className="text-sm font-bold text-white">
                        {world.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{world.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {world.taskCount || 0} tasks
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {world.energyUsed || 0}/{world.energyLimit || 10}
                      </span>
                      <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: world.colorTheme,
                            width: `${((world.energyUsed || 0) / (world.energyLimit || 10)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              {worlds.length === 0 && (
                <div className="text-center py-8">
                  <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No worlds yet</p>
                  <button
                    onClick={() => {
                      setShowCreateModal(true)
                      setWorldMenuOpen(false)
                    }}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Create your first world
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-end p-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setWorldMenuOpen(!worldMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="w-4 h-4 text-white" />
          </motion.button>
          
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            onClick={handleCenterPlanets}
            className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crosshair className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [0, 35, 45], 
          fov: 60,
          far: 2000 
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Galaxy
            worlds={worlds}
            onWorldClick={handleWorldSelect}
            onWorldHover={handleWorldHover}
            hoveredWorld={godViewState.hoveredWorldId}
          />
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            minDistance={25}
            maxDistance={200}
            autoRotate={false}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI * 0.8}
            minPolarAngle={Math.PI * 0.2}
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN
            }}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Action Buttons */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-3">
        <motion.button
          onClick={handleCenterPlanets}
          disabled={isCentering}
          className="p-4 rounded-full backdrop-blur-md border border-white/20"
          style={{
            background: isCentering 
              ? 'linear-gradient(135deg, rgba(100,255,100,0.2), rgba(50,200,50,0.1))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Crosshair className="w-5 h-5 text-white" />
        </motion.button>

        {worlds.length === 0 && (
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="p-4 rounded-full backdrop-blur-md border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(100,200,255,0.2), rgba(50,150,255,0.1))',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </div>

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
