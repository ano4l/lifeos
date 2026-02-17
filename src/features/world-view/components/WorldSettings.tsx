import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Settings, Trash2, Edit3, Save, AlertTriangle, 
  Palette, Sparkles, Brain, Globe, Check
} from 'lucide-react'
import type { World, AIPersonality, SurfaceTexture, WorldType } from '@/types'

interface WorldSettingsProps {
  isOpen: boolean
  onClose: () => void
  world: World
  onUpdate: (updates: Partial<World>) => void
  onDelete: () => void
}

const WORLD_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899',
  '#ef4444', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
]

const SURFACE_TEXTURES: { value: SurfaceTexture; label: string }[] = [
  { value: 'rocky', label: 'Rocky' },
  { value: 'oceanic', label: 'Oceanic' },
  { value: 'gaseous', label: 'Gaseous' },
  { value: 'crystalline', label: 'Crystalline' },
  { value: 'volcanic', label: 'Volcanic' },
  { value: 'lush', label: 'Lush' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'metallic', label: 'Metallic' },
]

const AI_PERSONALITIES: { value: AIPersonality; label: string }[] = [
  { value: 'manager', label: 'Manager' },
  { value: 'coach', label: 'Coach' },
  { value: 'strategist', label: 'Strategist' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'analyst', label: 'Analyst' },
]

const WORLD_TYPES: { value: WorldType; label: string; description: string }[] = [
  { value: 'general', label: 'General', description: 'Standard productivity world' },
  { value: 'finance', label: 'Finance & Trading', description: 'Investment tracking with charts' },
  { value: 'development', label: 'Development', description: 'Code projects and sprints' },
  { value: 'creative', label: 'Creative', description: 'Art, design, and content' },
  { value: 'health', label: 'Health & Fitness', description: 'Wellness tracking' },
  { value: 'education', label: 'Education', description: 'Learning and courses' },
  { value: 'social', label: 'Social', description: 'Relationships and networking' },
  { value: 'gaming', label: 'Gaming', description: 'Games and entertainment' },
]

export default function WorldSettings({ 
  isOpen, 
  onClose, 
  world, 
  onUpdate, 
  onDelete 
}: WorldSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'ai' | 'danger'>('general')
  const [formData, setFormData] = useState({
    name: world.name,
    description: world.description || '',
    worldType: world.worldType,
    colorTheme: world.colorTheme,
    surfaceTexture: world.surfaceTexture,
    aiPersonality: world.aiPersonality,
    energyLimit: world.energyLimit,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdate(formData)
    setHasChanges(false)
  }

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI Settings', icon: Brain },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col pointer-events-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(10, 10, 20, 0.99))',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 25px 80px rgba(0, 0, 0, 0.6), 0 0 100px ${world.colorTheme}20`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${formData.colorTheme}, ${formData.colorTheme}80)` }}
                  >
                    <span className="text-xl font-bold text-white">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      World Settings
                    </h2>
                    <p className="text-muted-foreground text-sm">{formData.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                                ${isActive ? 'text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: world.colorTheme }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'general' && (
                    <motion.div
                      key="general"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          World Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                                   text-white placeholder:text-muted-foreground
                                   focus:outline-none focus:border-white/20"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                                   text-white placeholder:text-muted-foreground resize-none
                                   focus:outline-none focus:border-white/20"
                        />
                      </div>

                      {/* World Type */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          World Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {WORLD_TYPES.map(({ value, label, description }) => (
                            <button
                              key={value}
                              onClick={() => handleChange('worldType', value)}
                              className={`p-3 rounded-xl text-left transition-all border
                                        ${formData.worldType === value
                                          ? 'border-white/30 bg-white/10'
                                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                            >
                              <div className="flex items-center gap-2">
                                {formData.worldType === value && (
                                  <Check className="w-4 h-4" style={{ color: world.colorTheme }} />
                                )}
                                <span className="font-medium text-white text-sm">{label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Energy Limit */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Daily Energy Limit
                        </label>
                        <input
                          type="number"
                          value={formData.energyLimit}
                          onChange={(e) => handleChange('energyLimit', parseInt(e.target.value) || 100)}
                          min={10}
                          max={500}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                                   text-white focus:outline-none focus:border-white/20"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'appearance' && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Color Theme */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          Color Theme
                        </label>
                        <div className="grid grid-cols-6 gap-3">
                          {WORLD_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleChange('colorTheme', color)}
                              className={`w-full aspect-square rounded-xl transition-all
                                        ${formData.colorTheme === color
                                          ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110'
                                          : 'hover:scale-105'
                                        }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Surface Texture */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          Planet Surface
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                          {SURFACE_TEXTURES.map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => handleChange('surfaceTexture', value)}
                              className={`p-3 rounded-xl text-center transition-all border
                                        ${formData.surfaceTexture === value
                                          ? 'border-white/30 bg-white/10'
                                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                            >
                              <span className="text-sm text-white">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'ai' && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* AI Personality */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          AI Personality
                        </label>
                        <div className="space-y-2">
                          {AI_PERSONALITIES.map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => handleChange('aiPersonality', value)}
                              className={`w-full p-4 rounded-xl text-left transition-all border flex items-center gap-3
                                        ${formData.aiPersonality === value
                                          ? 'border-white/30 bg-white/10'
                                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                            >
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${world.colorTheme}30` }}
                              >
                                <Brain className="w-5 h-5" style={{ color: world.colorTheme }} />
                              </div>
                              <span className="font-medium text-white">{label}</span>
                              {formData.aiPersonality === value && (
                                <Check className="w-4 h-4 ml-auto" style={{ color: world.colorTheme }} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'danger' && (
                    <motion.div
                      key="danger"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-red-400">Delete World</h3>
                            <p className="text-sm text-red-300/70 mt-1">
                              This action cannot be undone. All tasks, notes, and data associated 
                              with this world will be permanently deleted.
                            </p>
                          </div>
                        </div>
                        
                        {!showDeleteConfirm ? (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 
                                     hover:bg-red-500/30 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete World
                          </button>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm text-red-300">
                              Are you sure? Type <strong>"{world.name}"</strong> to confirm.
                            </p>
                            <input
                              type="text"
                              placeholder="Type world name to confirm..."
                              className="w-full px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30
                                       text-white placeholder:text-red-300/50
                                       focus:outline-none focus:border-red-500/50"
                              onChange={(e) => {
                                if (e.target.value === world.name) {
                                  handleDelete()
                                }
                              }}
                            />
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="text-sm text-muted-foreground hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground 
                           hover:text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`px-8 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2
                            ${hasChanges
                              ? 'text-white'
                              : 'text-muted-foreground bg-white/5 cursor-not-allowed'
                            }`}
                  style={hasChanges ? { backgroundColor: world.colorTheme } : {}}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
