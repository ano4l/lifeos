import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Zap, Tag, Clock } from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import type { TaskPriority } from '@/types'

interface QuickAddTaskProps {
  isOpen: boolean
  onClose: () => void
  worldId: string
  worldColor: string
}

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-white/20' },
  { value: 'medium', label: 'Medium', color: 'bg-cosmos-energy' },
  { value: 'high', label: 'High', color: 'bg-cosmos-warning' },
  { value: 'urgent', label: 'Urgent', color: 'bg-cosmos-danger' },
]

export default function QuickAddTask({ isOpen, onClose, worldId, worldColor }: QuickAddTaskProps) {
  const { addTask } = useWorldStore()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [energyCost, setEnergyCost] = useState(3)
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addTask(worldId, {
      worldId,
      title: title.trim(),
      status: 'pending',
      priority,
      energyCost,
      dueDate: dueDate || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
      tags,
      isRecurring: false,
    })

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTitle('')
    setPriority('medium')
    setDueDate('')
    setEnergyCost(3)
    setEstimatedMinutes(30)
    setTags([])
    setTagInput('')
    setShowAdvanced(false)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg h-fit max-h-[90vh]
                       glass-panel rounded-2xl z-50"
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-display font-semibold text-white">Quick Add Task</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {/* Title Input */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-3 rounded-xl bg-cosmos-stardust border border-white/10
                           text-white text-lg placeholder:text-muted-foreground
                           focus:outline-none focus:border-cosmos-energy"
                  autoFocus
                />

                {/* Priority Selection */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Priority</label>
                  <div className="flex gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                                  ${priority === p.value
                                    ? `${p.color} text-white`
                                    : 'bg-cosmos-stardust text-muted-foreground hover:text-white'
                                  }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Options */}
                <div className="flex flex-wrap gap-2">
                  {/* Due Date */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-stardust">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-transparent text-white text-sm focus:outline-none
                               [color-scheme:dark]"
                    />
                  </div>

                  {/* Energy Cost */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-stardust">
                    <Zap className="w-4 h-4 text-cosmos-warning" />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={energyCost}
                      onChange={(e) => setEnergyCost(Number(e.target.value))}
                      className="w-12 bg-transparent text-white text-sm focus:outline-none text-center"
                    />
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-stardust">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                      className="w-16 bg-transparent text-white text-sm focus:outline-none text-center"
                    />
                    <span className="text-muted-foreground text-sm">min</span>
                  </div>
                </div>

                {/* Advanced Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  {showAdvanced ? 'Hide' : 'Show'} advanced options
                </button>

                {/* Advanced Options */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Tags */}
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Tags</label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-stardust">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                              placeholder="Add tag..."
                              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2 rounded-lg bg-cosmos-stardust text-white text-sm
                                     hover:bg-cosmos-aurora transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="flex items-center gap-1 px-2 py-1 rounded-full
                                         bg-white/10 text-sm text-white"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="hover:text-cosmos-danger"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-6 py-2 rounded-xl font-medium transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${worldColor}, ${worldColor}cc)`,
                    color: 'white',
                  }}
                >
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
