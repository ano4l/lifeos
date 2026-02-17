import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { format, addDays, isToday, isTomorrow, startOfDay } from 'date-fns'
import type { Task } from '@/types'

interface TimelineProps {
  tasks: Task[]
  worldColor: string
}

export default function Timeline({ tasks, worldColor }: TimelineProps) {
  const today = startOfDay(new Date())
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = startOfDay(new Date(task.dueDate))
      return taskDate.getTime() === date.getTime() && task.status !== 'completed'
    })
  }

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-display font-semibold text-white">Timeline</h3>
      </div>

      <div className="space-y-3">
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day)
          const hasUrgent = dayTasks.some((t) => t.priority === 'urgent')
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center
                            ${isToday(day) 
                              ? 'bg-gradient-to-br from-cosmos-energy to-cosmos-glow text-white' 
                              : 'bg-cosmos-stardust text-muted-foreground'
                            }`}
                >
                  <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                  <span className="text-sm font-bold">{format(day, 'd')}</span>
                </div>
                {index < days.length - 1 && (
                  <div className="w-0.5 h-6 bg-white/10 my-1" />
                )}
              </div>

              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {getDayLabel(day)}
                </p>

                {dayTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50">No tasks</p>
                ) : (
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs
                                  ${task.priority === 'urgent' 
                                    ? 'bg-cosmos-danger/20 text-cosmos-danger' 
                                    : 'bg-white/5 text-white/80'
                                  }`}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: worldColor }}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-2">
                        +{dayTasks.length - 3} more
                      </p>
                    )}
                  </div>
                )}
              </div>

              {hasUrgent && (
                <div className="w-2 h-2 rounded-full bg-cosmos-danger animate-pulse mt-3" />
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Upcoming deadlines</span>
          <span className="text-white font-medium">
            {tasks.filter((t) => t.dueDate && t.status !== 'completed').length}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
