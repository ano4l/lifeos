import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { World, Task, CriticalUpdate, GodViewState } from '@/types'
import { nanoid } from 'nanoid'

interface WorldState {
  worlds: World[]
  tasks: Record<string, Task[]>
  criticalUpdates: CriticalUpdate[]
  godViewState: GodViewState
  currentWorldId: string | null
  isLoading: boolean
  
  addWorld: (world: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => World
  updateWorld: (id: string, updates: Partial<World>) => void
  deleteWorld: (id: string) => void
  getWorld: (id: string) => World | undefined
  
  addTask: (worldId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Task
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (worldId: string, taskId: string) => void
  reorderTasks: (worldId: string, taskIds: string[]) => void
  getTasksByWorld: (worldId: string) => Task[]
  
  setCurrentWorld: (worldId: string | null) => void
  updateGodViewState: (updates: Partial<GodViewState>) => void
  
  addCriticalUpdate: (update: Omit<CriticalUpdate, 'id' | 'createdAt'>) => void
  dismissCriticalUpdate: (id: string) => void
}

const defaultGodViewState: GodViewState = {
  cameraPosition: [0, 50, 100],
  cameraTarget: [0, 0, 0],
  selectedWorldId: null,
  hoveredWorldId: null,
  isTransitioning: false,
  showConflicts: true,
  showSatellites: true,
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set, get) => ({
      worlds: [],
      tasks: {},
      criticalUpdates: [],
      godViewState: defaultGodViewState,
      currentWorldId: null,
      isLoading: false,

      addWorld: (worldData) => {
        const now = new Date().toISOString()
        const newWorld: World = {
          ...worldData,
          id: nanoid(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          worlds: [...state.worlds, newWorld],
          tasks: { ...state.tasks, [newWorld.id]: [] },
        }))
        return newWorld
      },

      updateWorld: (id, updates) => {
        set((state) => ({
          worlds: state.worlds.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
        }))
      },

      deleteWorld: (id) => {
        set((state) => {
          const { [id]: _, ...remainingTasks } = state.tasks
          return {
            worlds: state.worlds.filter((w) => w.id !== id),
            tasks: remainingTasks,
            currentWorldId: state.currentWorldId === id ? null : state.currentWorldId,
          }
        })
      },

      getWorld: (id) => get().worlds.find((w) => w.id === id),

      addTask: (worldId, taskData) => {
        const now = new Date().toISOString()
        const worldTasks = get().tasks[worldId] || []
        const newTask: Task = {
          ...taskData,
          id: nanoid(),
          order: worldTasks.length,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          tasks: {
            ...state.tasks,
            [worldId]: [...(state.tasks[worldId] || []), newTask],
          },
        }))
        
        const world = get().getWorld(worldId)
        if (world) {
          get().updateWorld(worldId, {
            taskCount: (world.taskCount || 0) + 1,
            urgentTaskCount: taskData.priority === 'urgent' 
              ? (world.urgentTaskCount || 0) + 1 
              : world.urgentTaskCount,
          })
        }
        
        return newTask
      },

      updateTask: (taskId, updates) => {
        set((state) => {
          const newTasks = { ...state.tasks }
          for (const worldId in newTasks) {
            newTasks[worldId] = newTasks[worldId].map((t) =>
              t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
            )
          }
          return { tasks: newTasks }
        })
      },

      deleteTask: (worldId, taskId) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [worldId]: state.tasks[worldId]?.filter((t) => t.id !== taskId) || [],
          },
        }))
      },

      reorderTasks: (worldId, taskIds) => {
        set((state) => {
          const worldTasks = state.tasks[worldId] || []
          const reordered = taskIds.map((id, index) => {
            const task = worldTasks.find((t) => t.id === id)
            return task ? { ...task, order: index } : null
          }).filter(Boolean) as Task[]
          
          return {
            tasks: {
              ...state.tasks,
              [worldId]: reordered,
            },
          }
        })
      },

      getTasksByWorld: (worldId) => {
        const tasks = get().tasks[worldId] || []
        return [...tasks].sort((a, b) => a.order - b.order)
      },

      setCurrentWorld: (worldId) => {
        set({ currentWorldId: worldId })
      },

      updateGodViewState: (updates) => {
        set((state) => ({
          godViewState: { ...state.godViewState, ...updates },
        }))
      },

      addCriticalUpdate: (updateData) => {
        const newUpdate: CriticalUpdate = {
          ...updateData,
          id: nanoid(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          criticalUpdates: [...state.criticalUpdates, newUpdate],
        }))
      },

      dismissCriticalUpdate: (id) => {
        set((state) => ({
          criticalUpdates: state.criticalUpdates.map((u) =>
            u.id === id ? { ...u, isRead: true } : u
          ),
        }))
      },
    }),
    {
      name: 'lifeos-world-storage',
      partialize: (state) => ({
        worlds: state.worlds,
        tasks: state.tasks,
        currentWorldId: state.currentWorldId,
      }),
    }
  )
)
