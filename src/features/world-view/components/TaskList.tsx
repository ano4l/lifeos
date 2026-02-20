import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Filter, SortAsc, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { useWorldStore } from '@/stores/useWorldStore'
import TaskItem from './TaskItem'
import type { Task, TaskPriority } from '@/types'

interface TaskListProps {
  worldId: string
  tasks: Task[]
  worldColor: string
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed'
type SortType = 'order' | 'priority' | 'dueDate' | 'created'

export default function TaskList({ worldId, tasks, worldColor }: TaskListProps) {
  const { reorderTasks } = useWorldStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('order')
  const [showFilters, setShowFilters] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'priority':
        const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case 'dueDate':
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return a.order - b.order
    }
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id)
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id)
      const reordered = arrayMove(sortedTasks, oldIndex, newIndex)
      reorderTasks(worldId, reordered.map((t) => t.id))
    }
  }

  const filterOptions: { value: FilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Circle className="w-4 h-4" /> },
    { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
    { value: 'in_progress', label: 'In Progress', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" /> },
  ]

  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white">Tasks</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:text-white transition-colors">
              <SortAsc className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="text-white font-medium">{pendingCount}</span> pending
          </span>
          <span className="text-muted-foreground">
            <span className="text-cosmos-warning font-medium">{inProgressCount}</span> in progress
          </span>
          <span className="text-muted-foreground">
            <span className="text-cosmos-success font-medium">{completedCount}</span> done
          </span>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mt-4">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all
                              ${filter === option.value
                                ? 'bg-white/10 text-white'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                              }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-muted-foreground mr-2">Sort by:</span>
                {(['order', 'priority', 'dueDate', 'created'] as SortType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`px-2 py-1 rounded text-xs transition-all
                              ${sort === s
                                ? 'bg-white/10 text-white'
                                : 'text-muted-foreground hover:text-white'
                              }`}
                  >
                    {s === 'dueDate' ? 'Due Date' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task List */}
      <div className="p-2">
        {sortedTasks.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cosmos-stardust/50 
                          flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add a task to get started
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    worldId={worldId}
                    worldColor={worldColor}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </motion.div>
  )
}
