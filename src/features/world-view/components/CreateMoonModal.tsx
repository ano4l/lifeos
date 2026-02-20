import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Briefcase, Rocket, Book, Heart, Palette, Users, Code, Music, Gamepad, Home, Globe, Star } from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import type { Moon, WorldIcon } from '@/types'

interface CreateMoonModalProps {
  isOpen: boolean
  onClose: () => void
  parentWorldId: string
  parentWorldColor: string
}

const MOON_ICONS: { icon: WorldIcon; Icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { icon: 'briefcase', Icon: Briefcase, label: 'Work' },
  { icon: 'rocket', Icon: Rocket, label: 'Projects' },
  { icon: 'book', Icon: Book, label: 'Learning' },
  { icon: 'heart', Icon: Heart, label: 'Personal' },
  { icon: 'palette', Icon: Palette, label: 'Creative' },
  { icon: 'users', Icon: Users, label: 'Team' },
  { icon: 'code', Icon: Code, label: 'Dev' },
  { icon: 'music', Icon: Music, label: 'Music' },
  { icon: 'gamepad', Icon: Gamepad, label: 'Gaming' },
  { icon: 'home', Icon: Home, label: 'Home' },
  { icon: 'globe', Icon: Globe, label: 'Travel' },
  { icon: 'star', Icon: Star, label: 'Goals' },
]

const MOON_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899',
  '#ef4444', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
]

export default function CreateMoonModal({ isOpen, onClose, parentWorldId, parentWorldColor }: CreateMoonModalProps) {
  const { addMoon } = useWorldStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<WorldIcon>('star')
  const [colorTheme, setColorTheme] = useState(parentWorldColor)

  const handleCreate = () => {
    if (!name.trim()) return

    const newMoon: Omit<Moon, 'id' | 'createdAt' | 'updatedAt'> = {
      parentWorldId,
      name: name.trim(),
      description: description.trim() || undefined,
      colorTheme,
      icon,
      taskCount: 0,
      urgentTaskCount: 0,
      completedToday: 0,
      energyUsed: 0,
      energyLimit: 50,
    }

    addMoon(newMoon)
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setIcon('star')
    setColorTheme(parentWorldColor)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 20, 30, 0.98), rgba(8, 10, 18, 0.99))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">New Moon</h2>
                <p className="text-xs text-white/40">Create a sub-world</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Moon Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing, Backend, Cardio..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all text-sm"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this moon about?"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all text-sm resize-none"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {MOON_ICONS.map(({ icon: iconVal, Icon, label }) => (
                    <button
                      key={iconVal}
                      onClick={() => setIcon(iconVal)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                        icon === iconVal
                          ? 'bg-white/15 border border-white/30 scale-105'
                          : 'bg-white/5 border border-transparent hover:bg-white/10'
                      }`}
                      title={label}
                    >
                      <Icon className="w-4 h-4 text-white/70" />
                      <span className="text-[10px] text-white/40">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {MOON_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorTheme(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        colorTheme === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a12] scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="flex-1 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: name.trim()
                    ? `linear-gradient(135deg, ${colorTheme}, ${colorTheme}cc)`
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: name.trim() ? `0 4px 15px ${colorTheme}40` : 'none',
                }}
              >
                Create Moon
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
