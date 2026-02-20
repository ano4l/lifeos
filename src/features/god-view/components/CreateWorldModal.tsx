import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Briefcase, Rocket, Book, Heart, Palette, Users, Code, Music, Gamepad, Home, Globe, Star } from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import type { World, WorldIcon, SurfaceTexture, AIPersonality, WorldType } from '@/types'

interface CreateWorldModalProps {
  isOpen: boolean
  onClose: () => void
}

const WORLD_ICONS: { icon: WorldIcon; Icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { icon: 'briefcase', Icon: Briefcase, label: 'Work' },
  { icon: 'rocket', Icon: Rocket, label: 'Startup' },
  { icon: 'book', Icon: Book, label: 'Learning' },
  { icon: 'heart', Icon: Heart, label: 'Personal' },
  { icon: 'palette', Icon: Palette, label: 'Creative' },
  { icon: 'users', Icon: Users, label: 'Social' },
  { icon: 'code', Icon: Code, label: 'Dev' },
  { icon: 'music', Icon: Music, label: 'Music' },
  { icon: 'gamepad', Icon: Gamepad, label: 'Gaming' },
  { icon: 'home', Icon: Home, label: 'Home' },
  { icon: 'globe', Icon: Globe, label: 'Travel' },
  { icon: 'star', Icon: Star, label: 'Goals' },
]

const WORLD_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899',
  '#ef4444', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
]

const SURFACE_TEXTURES: { value: SurfaceTexture; label: string; description: string }[] = [
  { value: 'rocky', label: 'Rocky', description: 'Stable, grounded' },
  { value: 'oceanic', label: 'Oceanic', description: 'Fluid, adaptable' },
  { value: 'gaseous', label: 'Gaseous', description: 'Creative, expansive' },
  { value: 'crystalline', label: 'Crystalline', description: 'Precise, structured' },
  { value: 'volcanic', label: 'Volcanic', description: 'Intense, dynamic' },
  { value: 'lush', label: 'Lush', description: 'Growing, nurturing' },
  { value: 'frozen', label: 'Frozen', description: 'Calm, preserved' },
  { value: 'metallic', label: 'Metallic', description: 'Technical, refined' },
]

const AI_PERSONALITIES: { value: AIPersonality; label: string; description: string }[] = [
  { value: 'manager', label: 'Manager', description: 'Task-focused, organized' },
  { value: 'coach', label: 'Coach', description: 'Motivating, supportive' },
  { value: 'strategist', label: 'Strategist', description: 'Big-picture thinking' },
  { value: 'mentor', label: 'Mentor', description: 'Guidance, wisdom' },
  { value: 'analyst', label: 'Analyst', description: 'Data-driven, precise' },
]

export default function CreateWorldModal({ isOpen, onClose }: CreateWorldModalProps) {
  const { addWorld } = useWorldStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'briefcase' as WorldIcon,
    colorTheme: WORLD_COLORS[0],
    surfaceTexture: 'rocky' as SurfaceTexture,
    aiPersonality: 'manager' as AIPersonality,
    worldType: 'general' as WorldType,
  })

  const handleCreate = () => {
    const newWorld: Omit<World, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'anonymous',
      name: formData.name,
      description: formData.description,
      colorTheme: formData.colorTheme,
      icon: formData.icon,
      worldType: formData.worldType,
      aiPersonality: formData.aiPersonality,
      aiTone: 'professional',
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      sizeFactor: 1,
      glowIntensity: 0.5,
      orbitSpeed: 1,
      rotationSpeed: 1,
      surfaceTexture: formData.surfaceTexture,
      isPinned: false,
      taskCount: 0,
      urgentTaskCount: 0,
      completedToday: 0,
      energyUsed: 0,
      energyLimit: 100,
    }
    
    addWorld(newWorld)
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setFormData({
      name: '',
      description: '',
      icon: 'briefcase',
      colorTheme: WORLD_COLORS[0],
      surfaceTexture: 'rocky',
      aiPersonality: 'manager',
      worldType: 'general',
    })
    onClose()
  }

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length > 0
    return true
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div 
              className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl flex flex-col pointer-events-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(10, 10, 20, 0.98))',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 100px rgba(0, 217, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Create New World
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Step {step} of 3
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-cosmos-nebula">
              <motion.div
                className="h-full bg-gradient-to-r from-cosmos-energy to-cosmos-glow"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        World Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Career, Side Project, Health..."
                        className="w-full px-4 py-3 rounded-xl bg-cosmos-stardust border border-white/10
                                 text-white placeholder:text-muted-foreground
                                 focus:outline-none focus:border-cosmos-energy focus:ring-1 focus:ring-cosmos-energy"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What is this world about?"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-cosmos-stardust border border-white/10
                                 text-white placeholder:text-muted-foreground resize-none
                                 focus:outline-none focus:border-cosmos-energy focus:ring-1 focus:ring-cosmos-energy"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Icon
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {WORLD_ICONS.map(({ icon, Icon, label }) => (
                          <button
                            key={icon}
                            onClick={() => setFormData({ ...formData, icon })}
                            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all
                                      ${formData.icon === icon
                                        ? 'bg-cosmos-energy text-white'
                                        : 'bg-cosmos-stardust hover:bg-cosmos-aurora text-muted-foreground hover:text-white'
                                      }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Color Theme
                      </label>
                      <div className="grid grid-cols-6 gap-3">
                        {WORLD_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setFormData({ ...formData, colorTheme: color })}
                            className={`w-full aspect-square rounded-xl transition-all
                                      ${formData.colorTheme === color
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-cosmos-void scale-110'
                                        : 'hover:scale-105'
                                      }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Planet Surface
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {SURFACE_TEXTURES.map(({ value, label, description }) => (
                          <button
                            key={value}
                            onClick={() => setFormData({ ...formData, surfaceTexture: value })}
                            className={`p-4 rounded-xl text-left transition-all
                                      ${formData.surfaceTexture === value
                                        ? 'bg-cosmos-energy/20 border-cosmos-energy'
                                        : 'bg-cosmos-stardust hover:bg-cosmos-aurora'
                                      } border border-white/10`}
                          >
                            <p className="font-medium text-white">{label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        AI Personality
                      </label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose how your world's AI assistant will interact with you
                      </p>
                      <div className="space-y-3">
                        {AI_PERSONALITIES.map(({ value, label, description }) => (
                          <button
                            key={value}
                            onClick={() => setFormData({ ...formData, aiPersonality: value })}
                            className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4
                                      ${formData.aiPersonality === value
                                        ? 'bg-cosmos-energy/20 border-cosmos-energy'
                                        : 'bg-cosmos-stardust hover:bg-cosmos-aurora'
                                      } border border-white/10`}
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: formData.colorTheme }}
                            >
                              <span className="text-lg font-bold text-white">
                                {label.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{label}</p>
                              <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 rounded-xl bg-cosmos-stardust/50 border border-white/10">
                      <p className="text-sm text-muted-foreground mb-2">Preview</p>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: formData.colorTheme }}
                        >
                          {(() => {
                            const IconData = WORLD_ICONS.find((i) => i.icon === formData.icon)
                            if (IconData) {
                              const Icon = IconData.Icon
                              return <Icon className="w-8 h-8 text-white" />
                            }
                            return null
                          })()}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-white text-lg">
                            {formData.name || 'Your World'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formData.surfaceTexture} • {formData.aiPersonality} AI
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all
                          ${step === 1
                            ? 'text-muted-foreground cursor-not-allowed'
                            : 'text-white hover:bg-white/10'
                          }`}
                disabled={step === 1}
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => canProceed() && setStep(step + 1)}
                  disabled={!canProceed()}
                  className={`px-8 py-2.5 rounded-xl font-medium transition-all
                            ${canProceed()
                              ? 'bg-gradient-to-r from-cosmos-energy to-cosmos-glow text-white'
                              : 'bg-cosmos-stardust text-muted-foreground cursor-not-allowed'
                            }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="px-8 py-2.5 rounded-xl font-medium transition-all
                           bg-gradient-to-r from-cosmos-energy to-cosmos-glow text-white
                           hover:shadow-lg hover:shadow-cosmos-energy/30"
                >
                  Create World
                </button>
              )}
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
