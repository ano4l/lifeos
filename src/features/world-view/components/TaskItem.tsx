import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  GripVertical, 
  Check, 
  MoreHorizontal, 
  Calendar, 
  Zap,
  Trash2,
  Edit3,
  Clock
} from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import type { Task } from '@/types'
import { format, isPast, isToday } from 'date-fns'

interface TaskItemProps {
  task: Task
  worldId: string
  worldColor: string
}

const priorityColors = {
  urgent: 'border-l-cosmos-danger',
  high: 'border-l-cosmos-warning',
  medium: 'border-l-cosmos-energy',
  low: 'border-l-white/20',
}

const priorityBadges = {
  urgent: 'bg-cosmos-danger/20 text-cosmos-danger',
  high: 'bg-cosmos-warning/20 text-cosmos-warning',
  medium: 'bg-cosmos-energy/20 text-cosmos-energy',
  low: 'bg-white/10 text-muted-foreground',
}

export default function TaskItem({ task, worldId, worldColor }: TaskItemProps) {
  const { updateTask, deleteTask } = useWorldStore()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleToggleComplete = () => {
    if (task.status === 'completed') {
      updateTask(task.id, { status: 'pending', completedAt: undefined })
    } else {
      updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() })
    }
  }

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteTask(worldId, task.id)
    setShowMenu(false)
  }

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        background: task.status === 'completed' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
          : `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`,
        boxShadow: isDragging 
          ? `0 10px 40px ${worldColor}30, 0 0 0 1px rgba(255,255,255,0.1)`
          : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: isDragging ? 0.8 : 1, 
        y: 0,
        scale: isDragging ? 1.03 : 1,
      }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: `0 8px 30px ${worldColor}20, 0 0 0 1px rgba(255,255,255,0.15)`,
      }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-2xl backdrop-blur-md border border-white/10
                 hover:border-white/20 transition-all
                 border-l-4 ${priorityColors[task.priority]}
                 ${task.status === 'completed' ? 'opacity-60' : ''}
                 ${isOverdue ? 'ring-2 ring-cosmos-danger/50' : ''}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 rounded opacity-0 group-hover:opacity-100 
                   hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Checkbox - Enhanced */}
        <motion.button
          onClick={handleToggleComplete}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center
                    transition-all relative overflow-hidden ${
                      task.status === 'completed'
                        ? 'bg-gradient-to-br from-green-400 to-green-600'
                        : 'bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40'
                    }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            boxShadow: task.status === 'completed' 
              ? '0 0 15px rgba(74, 222, 128, 0.4)' 
              : 'none',
          }}
        >
          {task.status === 'completed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
          {task.status !== 'completed' && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{ backgroundColor: worldColor }}
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 0.2 }}
            />
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              className="w-full bg-transparent border-b border-white/20 text-white
                       focus:outline-none focus:border-cosmos-energy pb-1"
              autoFocus
            />
          ) : (
            <p className={`text-white font-medium ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
            }`}>
              {task.title}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority Badge - Enhanced */}
            <motion.span 
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide
                         backdrop-blur-sm ${priorityBadges[task.priority]}`}
              style={{
                boxShadow: task.priority === 'urgent' 
                  ? '0 0 10px rgba(239, 68, 68, 0.3)' 
                  : 'none',
              }}
              animate={task.priority === 'urgent' ? {
                boxShadow: [
                  '0 0 5px rgba(239, 68, 68, 0.2)',
                  '0 0 15px rgba(239, 68, 68, 0.4)',
                  '0 0 5px rgba(239, 68, 68, 0.2)',
                ],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {task.priority}
            </motion.span>

            {/* Due Date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-cosmos-danger' : isDueToday ? 'text-cosmos-warning' : 'text-muted-foreground'
              }`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {/* Energy Cost */}
            {task.energyCost > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="w-3 h-3" />
                {task.energyCost}
              </span>
            )}

            {/* Estimated Time */}
            {task.estimatedMinutes && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {task.estimatedMinutes}m
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                     hover:bg-white/10 transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Dropdown Menu - Enhanced glassmorphism */}
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className="absolute right-0 top-8 z-10 w-40 py-2 rounded-xl
                       backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.98))',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <button
                onClick={() => {
                  setIsEditing(true)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white
                         hover:bg-white/10 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cosmos-danger
                         hover:bg-cosmos-danger/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress indicator for world color - Enhanced */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
        initial={{ width: 0 }}
        animate={{ 
          width: task.status === 'completed' ? '100%' : '0%',
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          background: `linear-gradient(90deg, ${worldColor}, ${worldColor}80)`,
          boxShadow: task.status === 'completed' ? `0 0 10px ${worldColor}50` : 'none',
        }}
      />

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${worldColor}10 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  )
}
