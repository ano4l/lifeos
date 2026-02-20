import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Settings, Trash2, X } from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import { useState, useMemo } from 'react'
import type { Task, TaskPriority, NotebookEntry } from '@/types'

export default function MoonView() {
  const { worldId, moonId } = useParams<{ worldId: string; moonId: string }>()
  const navigate = useNavigate()
  const { getWorld, getMoon, getMoonTasks, addMoonTask, updateMoonTask, deleteMoonTask, updateMoon, deleteMoon } = useWorldStore()

  const world = worldId ? getWorld(worldId) : undefined
  const moon = moonId ? getMoon(moonId) : undefined
  const tasks = moonId ? getMoonTasks(moonId) : []

  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(moon?.notebookEntries || [])
  const [notebookInput, setNotebookInput] = useState('')

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks
    if (filter === 'completed') return tasks.filter(t => t.status === 'completed')
    return tasks.filter(t => t.status !== 'completed')
  }, [tasks, filter])

  const pendingTasks = tasks.filter(t => t.status !== 'completed')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed')

  if (!world || !moon) {
    return (
      <div className="min-h-screen bg-cosmos-void flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Moon Not Found</h2>
          <button
            onClick={() => navigate(worldId ? `/world/${worldId}` : '/')}
            className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !moonId) return
    addMoonTask(moonId, {
      worldId: worldId || '',
      title: newTaskTitle.trim(),
      status: 'pending',
      priority: newTaskPriority,
      energyCost: newTaskPriority === 'urgent' ? 3 : newTaskPriority === 'high' ? 2 : 1,
      tags: [],
      isRecurring: false,
    })
    setNewTaskTitle('')
    setNewTaskPriority('medium')
    setShowQuickAdd(false)
  }

  const handleToggleTask = (task: Task) => {
    updateMoonTask(task.id, {
      status: task.status === 'completed' ? 'pending' : 'completed',
      completedAt: task.status === 'completed' ? undefined : new Date().toISOString(),
    })
  }

  const handleDeleteTask = (taskId: string) => {
    if (!moonId) return
    deleteMoonTask(moonId, taskId)
  }

  const handleDeleteMoon = () => {
    if (!moonId) return
    deleteMoon(moonId)
    navigate(`/world/${worldId}`)
  }

  const handleAddNote = () => {
    if (!notebookInput.trim()) return
    const newEntry: NotebookEntry = {
      id: Date.now().toString(),
      worldId: moonId || '',
      title: '',
      content: notebookInput.trim(),
      tags: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [...notebookEntries, newEntry]
    setNotebookEntries(updated)
    if (moonId) {
      updateMoon(moonId, { notebookEntries: updated })
    }
    setNotebookInput('')
  }

  const priorityColors: Record<TaskPriority, string> = {
    low: '#10b981',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
  }

  return (
    <div
      className="min-h-screen min-h-[100dvh] relative"
      style={{
        background: `linear-gradient(135deg, ${moon.colorTheme}12 0%, #050510 40%, #0a0a15 60%, ${moon.colorTheme}06 100%)`,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/8 safe-area-top"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.85) 100%)',
        }}
      >
        <div className="px-4 py-3 safe-area-x">
          <div className="flex items-center justify-between gap-2">
            {/* Left - Back & Moon Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => navigate(`/world/${worldId}`)}
                className="p-2 -ml-1 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </button>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${moon.colorTheme}, ${moon.colorTheme}80)`,
                }}
              >
                <span className="text-sm font-bold text-white">
                  {moon.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white truncate">{moon.name}</h1>
                  <span className="text-xs text-white/30 flex-shrink-0">moon</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>{world.name}</span>
                  <span>&middot;</span>
                  <span>{pendingTasks.length} pending</span>
                  <span>&middot;</span>
                  <span>{completedTasks.length} done</span>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium active:scale-95 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${moon.colorTheme}, ${moon.colorTheme}cc)`,
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Task</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                <Settings className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 safe-area-x">
        {/* Urgent alert */}
        {urgentTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 mb-4"
          >
            <p className="text-sm text-red-300 font-medium">
              {urgentTasks.length} urgent {urgentTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-white/5 w-fit">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'all' ? `All (${tasks.length})` : f === 'pending' ? `Pending (${pendingTasks.length})` : `Done (${completedTasks.length})`}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2 mb-8">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">
                {filter === 'all' ? 'No tasks yet. Add one!' : `No ${filter} tasks.`}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  task.status === 'completed'
                    ? 'bg-white/3 border-white/5'
                    : 'bg-white/5 border-white/8 hover:bg-white/8'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: task.status === 'completed' ? moon.colorTheme : 'rgba(255,255,255,0.2)',
                    backgroundColor: task.status === 'completed' ? moon.colorTheme : 'transparent',
                  }}
                >
                  {task.status === 'completed' && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-white/30 line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-white/30 mt-0.5 truncate">{task.description}</p>
                  )}
                </div>

                {/* Priority dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priorityColors[task.priority] }}
                  title={task.priority}
                />

                {/* Delete */}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white/30" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Notebook section */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-4 mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">Notes</h3>
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {notebookEntries.length === 0 ? (
              <p className="text-xs text-white/25">No notes yet.</p>
            ) : (
              notebookEntries.map((entry) => (
                <div key={entry.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-xs text-white/70">{entry.content}</p>
                  <p className="text-[10px] text-white/20 mt-1">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={notebookInput}
              onChange={(e) => setNotebookInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              placeholder="Write a note..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-white/25 focus:outline-none focus:border-white/20"
            />
            <button
              onClick={handleAddNote}
              disabled={!notebookInput.trim()}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white active:scale-95 transition-all disabled:opacity-30"
              style={{ background: `${moon.colorTheme}40` }}
            >
              Add
            </button>
          </div>
        </div>
      </main>

      {/* Quick Add Task Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowQuickAdd(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 20, 30, 0.98), rgba(8, 10, 18, 0.99))',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Add Task</h3>
                  <button onClick={() => setShowQuickAdd(false)} className="p-1 rounded-lg hover:bg-white/10">
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>

                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Task title..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20 text-sm mb-3"
                  autoFocus
                />

                {/* Priority selector */}
                <div className="flex gap-2 mb-4">
                  {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                        newTaskPriority === p
                          ? 'text-white border'
                          : 'text-white/40 bg-white/5 border border-transparent'
                      }`}
                      style={{
                        borderColor: newTaskPriority === p ? priorityColors[p] : undefined,
                        backgroundColor: newTaskPriority === p ? `${priorityColors[p]}20` : undefined,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="w-full py-3 rounded-xl text-white text-sm font-medium active:scale-[0.98] transition-all disabled:opacity-40"
                  style={{
                    background: newTaskTitle.trim()
                      ? `linear-gradient(135deg, ${moon.colorTheme}, ${moon.colorTheme}cc)`
                      : 'rgba(255,255,255,0.1)',
                  }}
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowSettings(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 20, 30, 0.98), rgba(8, 10, 18, 0.99))',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="p-4">
                <h3 className="text-base font-bold text-white mb-4">Moon Settings</h3>

                <p className="text-sm text-white/60 mb-1">Name</p>
                <p className="text-white font-medium mb-4">{moon.name}</p>

                {moon.description && (
                  <>
                    <p className="text-sm text-white/60 mb-1">Description</p>
                    <p className="text-white/80 text-sm mb-4">{moon.description}</p>
                  </>
                )}

                <p className="text-sm text-white/60 mb-1">Stats</p>
                <div className="flex gap-4 text-sm text-white/70 mb-6">
                  <span>{tasks.length} tasks</span>
                  <span>{completedTasks.length} completed</span>
                  <span>{urgentTasks.length} urgent</span>
                </div>

                <button
                  onClick={handleDeleteMoon}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/25 active:scale-[0.98] transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Moon
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
