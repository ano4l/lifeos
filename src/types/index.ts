export interface User {
  id: string
  email?: string
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}

export interface WorldSection {
  id: string
  name: string
  description?: string
  colorTheme?: string
  taskCount?: number
  order: number
}

export interface World {
  id: string
  userId: string
  name: string
  description?: string
  colorTheme: string
  icon: WorldIcon
  worldType: WorldType
  aiPersonality: AIPersonality
  aiTone: AITone
  positionX: number
  positionY: number
  positionZ: number
  sizeFactor: number
  glowIntensity: number
  orbitSpeed: number
  rotationSpeed: number
  surfaceTexture: SurfaceTexture
  isPinned: boolean
  taskCount: number
  urgentTaskCount: number
  completedToday: number
  energyUsed: number
  energyLimit: number
  sections?: WorldSection[]
  notebookEntries?: NotebookEntry[]
  createdAt: string
  updatedAt: string
}

export type WorldIcon = 
  | 'briefcase' 
  | 'rocket' 
  | 'book' 
  | 'heart' 
  | 'palette' 
  | 'users' 
  | 'code' 
  | 'music'
  | 'gamepad'
  | 'home'
  | 'globe'
  | 'star'
  | 'trending-up'
  | 'dollar-sign'

export type WorldType = 
  | 'general'
  | 'finance'
  | 'development'
  | 'creative'
  | 'health'
  | 'education'
  | 'social'
  | 'gaming'

export interface NotebookEntry {
  id: string
  worldId: string
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export type AIPersonality = 'manager' | 'coach' | 'strategist' | 'mentor' | 'analyst'

export type AITone = 'professional' | 'friendly' | 'direct' | 'encouraging' | 'calm'

export type SurfaceTexture = 
  | 'rocky' 
  | 'oceanic' 
  | 'gaseous' 
  | 'crystalline' 
  | 'volcanic' 
  | 'lush' 
  | 'frozen' 
  | 'metallic'

export interface Task {
  id: string
  worldId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  energyCost: number
  dueDate?: string
  scheduledDate?: string
  completedAt?: string
  parentTaskId?: string
  subtasks?: Task[]
  tags: string[]
  notes?: string
  isRecurring: boolean
  recurringPattern?: RecurringPattern
  estimatedMinutes?: number
  actualMinutes?: number
  order: number
  createdAt: string
  updatedAt: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'deferred'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: string
}

export interface CriticalUpdate {
  id: string
  userId: string
  worldId: string
  type: 'satellite' | 'rocket'
  title: string
  message?: string
  urgencyLevel: number
  isRead: boolean
  relatedTaskId?: string
  createdAt: string
  expiresAt?: string
}

export interface EnergyLog {
  id: string
  worldId: string
  energyUsed: number
  activityType: ActivityType
  taskId?: string
  loggedAt: string
}

export type ActivityType = 
  | 'task_completion' 
  | 'task_creation'
  | 'planning' 
  | 'decision_making' 
  | 'deep_work'
  | 'meeting'
  | 'break'

export interface WorldConflict {
  id: string
  userId: string
  worldAId: string
  worldBId: string
  conflictType: ConflictType
  severity: number
  isResolved: boolean
  createdAt: string
  resolvedAt?: string
}

export type ConflictType = 
  | 'time_overlap' 
  | 'resource_conflict' 
  | 'priority_clash' 
  | 'energy_overload'

export interface TimelineEvent {
  id: string
  type: 'task' | 'deadline' | 'milestone' | 'event'
  title: string
  startTime: string
  endTime?: string
  worldId: string
  worldColor: string
  priority: TaskPriority
  isAllDay: boolean
}

export interface WorldStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
  averageEnergyPerTask: number
  streakDays: number
  mostProductiveHour: number
}

export interface GodViewState {
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  selectedWorldId: string | null
  hoveredWorldId: string | null
  isTransitioning: boolean
  showConflicts: boolean
  showSatellites: boolean
}

export interface ViewTransition {
  type: 'god_to_world' | 'world_to_god'
  worldId: string
  duration: number
  startPosition: [number, number, number]
  endPosition: [number, number, number]
}

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'
export type WidgetRefreshRate = 1000 | 5000 | 15000 | 30000 | 60000 | 'manual'
export type ChartType = 'line' | 'bar' | 'area' | 'sparkline'

export interface WidgetConfig {
  id: string
  type: string
  title: string
  size: WidgetSize
  position: number
  isVisible: boolean
  refreshRate: WidgetRefreshRate
  customSettings: Record<string, any>
}

export interface WidgetSettings {
  theme?: 'dark' | 'light' | 'auto'
  chartType?: ChartType
  showLegend?: boolean
  showGrid?: boolean
  animationsEnabled?: boolean
  compactMode?: boolean
  alertsEnabled?: boolean
  autoRefresh?: boolean
}

export interface HealthMetrics {
  steps: number
  stepsGoal: number
  water: number
  waterGoal: number
  sleep: number
  sleepGoal: number
  calories: number
  caloriesGoal: number
  heartRate: number
  workouts: number
  workoutsGoal: number
  weight?: number
  mood?: 'great' | 'good' | 'okay' | 'poor'
}

export interface DevelopmentMetrics {
  commits: number
  pullRequests: number
  issues: number
  codeReviews: number
  focusTime: string
  streak: number
  linesOfCode: number
  buildStatus: 'passing' | 'failing' | 'pending'
  testsPass: number
  testsFail: number
}

export interface FinanceMetrics {
  portfolio: {
    totalValue: number
    dailyChange: number
    dailyChangePercent: number
  }
  positions: Array<{
    symbol: string
    quantity: number
    avgPrice: number
    currentPrice: number
    pnl: number
    pnlPercent: number
  }>
}
