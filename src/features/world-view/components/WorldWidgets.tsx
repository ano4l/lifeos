import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { 
  Code2, Heart, BookOpen, Users, Gamepad2, Palette,
  GitBranch, Activity, Brain, MessageCircle, Trophy, Brush,
  Plus, X, ChevronDown, ChevronUp, Settings, Target, Flame,
  TrendingUp, Clock, Calendar, Award, Zap, Coffee, Dumbbell,
  Moon, Sun, Droplet, Star, GitPullRequest, GitCommit,
  Code, Terminal, Database, Cloud, Server, Cpu,
  Music, Video, Image, FileText, PenTool, Sparkles,
  GraduationCap, BookMark, BrainCircuit, Lightbulb,
  UserCheck, Bell, CalendarDays, MessageSquare,
  Joystick, Medal, Settings2, BarChart3, RefreshCw, Eye, EyeOff
} from 'lucide-react'
import type { WorldType } from '@/types'

interface WorldWidgetsProps {
  worldType: WorldType
  worldColor: string
}

interface WidgetConfig {
  id: string
  title: string
  icon: React.ReactNode
  isVisible: boolean
  refreshRate: number
  size: 'small' | 'medium' | 'large'
}

const WidgetCard = memo(({ 
  children, 
  className = '', 
  worldColor,
  onRemove,
  onSettings,
  isCustomizable = true
}: { 
  children: React.ReactNode
  className?: string
  worldColor: string
  onRemove?: () => void
  onSettings?: () => void
  isCustomizable?: boolean
}) => {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!shouldReduceMotion ? { y: -4 } : {}}
      transition={{ duration: shouldReduceMotion ? 0.1 : 0.3 }}
      className={`relative rounded-xl p-4 group ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {isCustomizable && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
})

WidgetCard.displayName = 'WidgetCard'

const DevelopmentWidgets = memo(({ worldColor }: { worldColor: string }) => {
  const shouldReduceMotion = useReducedMotion()
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)
  const [githubUsername, setGithubUsername] = useState('')
  const [focusGoal, setFocusGoal] = useState(6)
  const [showSettings, setShowSettings] = useState<Record<string, boolean>>({})
  const [widgetVisibility, setWidgetVisibility] = useState({
    github: true,
    focus: true,
    code: true,
    server: true,
  })
  
  const [stats, setStats] = useState({
    commits: 12,
    prs: 3,
    issues: 5,
    focusTime: 4.5,
    streak: 7,
    codeLines: 2847,
    buildStatus: 'passing' as 'passing' | 'failing' | 'pending',
    serverUptime: 99.9,
    testsPass: 247,
    testsFail: 3,
  })
  
  useEffect(() => {
    if (shouldReduceMotion) return
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        commits: prev.commits + (Math.random() > 0.8 ? 1 : 0),
        codeLines: prev.codeLines + Math.floor(Math.random() * 15),
        focusTime: prev.focusTime + (Math.random() * 0.1),
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [shouldReduceMotion])

  const toggleSettings = useCallback((widgetId: string) => {
    setShowSettings(prev => ({ ...prev, [widgetId]: !prev[widgetId] }))
  }, [])

  const focusPercentage = useMemo(() => 
    Math.min((stats.focusTime / focusGoal) * 100, 100),
    [stats.focusTime, focusGoal]
  )

  const widgets = useMemo(() => [
    {
      id: 'github',
      title: 'GitHub Activity',
      icon: <GitBranch className="w-4 h-4" />,
      visible: widgetVisibility.github,
      content: (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground">
              {githubUsername || '@username'}
            </div>
            <button
              onClick={() => toggleSettings('github')}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <Settings className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          
          <AnimatePresence>
            {showSettings.github && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-2 rounded-lg bg-white/5"
              >
                <input
                  type="text"
                  placeholder="GitHub username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-white/10 text-white text-sm placeholder:text-muted-foreground border-none focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <motion.p 
                className="text-lg font-bold text-white"
                key={stats.commits}
                initial={{ scale: 1.2, color: worldColor }}
                animate={{ scale: 1, color: '#ffffff' }}
              >
                {stats.commits}
              </motion.p>
              <p className="text-xs text-muted-foreground">Commits</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400">{stats.prs}</p>
              <p className="text-xs text-muted-foreground">PRs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">{stats.issues}</p>
              <p className="text-xs text-muted-foreground">Issues</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'focus',
      title: 'Focus Time',
      icon: <Brain className="w-4 h-4" />,
      visible: widgetVisibility.focus,
      content: (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground">Goal: {focusGoal}h/day</div>
            <button
              onClick={() => toggleSettings('focus')}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <Settings className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          
          <AnimatePresence>
            {showSettings.focus && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-2 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Daily Goal:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={focusGoal}
                    onChange={(e) => setFocusGoal(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded bg-white/10 text-white text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <span className="text-xs text-muted-foreground">hours</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-2xl font-bold text-white">{stats.focusTime.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Today's focus</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-400">{stats.streak} days</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </div>
          
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(to right, ${worldColor}, ${worldColor}cc)`,
                boxShadow: `0 0 10px ${worldColor}80`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${focusPercentage}%` }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'code',
      title: 'Code Metrics',
      icon: <Code className="w-4 h-4" />,
      visible: widgetVisibility.code,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Lines Written</span>
            <span className="text-sm font-bold text-white">{stats.codeLines.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tests</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-400">{stats.testsPass}</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-sm font-bold text-red-400">{stats.testsFail}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Build Status</span>
            <span className={`text-sm font-bold ${
              stats.buildStatus === 'passing' ? 'text-emerald-400' : 
              stats.buildStatus === 'failing' ? 'text-red-400' : 'text-amber-400'
            }`}>
              {stats.buildStatus}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'server',
      title: 'Server Status',
      icon: <Server className="w-4 h-4" />,
      visible: widgetVisibility.server,
      content: (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/20 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Online</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.serverUptime}%</p>
          <p className="text-xs text-muted-foreground">Uptime</p>
        </div>
      ),
    },
  ], [widgetVisibility, stats, githubUsername, focusGoal, showSettings, focusPercentage, worldColor, shouldReduceMotion, toggleSettings])

  const visibleWidgets = widgets.filter(w => w.visible)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Development Metrics</h3>
        <button 
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="Widget settings"
        >
          <Settings2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {visibleWidgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              worldColor={worldColor}
              onSettings={() => toggleSettings(widget.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${worldColor}30` }}
                >
                  {widget.icon}
                </div>
                <span className="font-medium text-white text-sm">{widget.title}</span>
              </div>
              {widget.content}
            </WidgetCard>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
})

DevelopmentWidgets.displayName = 'DevelopmentWidgets'

const HealthWidgets = memo(({ worldColor }: { worldColor: string }) => {
  const shouldReduceMotion = useReducedMotion()
  const [showSettings, setShowSettings] = useState(false)
  const [goals, setGoals] = useState({
    steps: 10000,
    water: 8,
    sleep: 8,
    calories: 2000,
  })
  
  const [stats, setStats] = useState({
    steps: 8432,
    water: 6,
    sleep: 7.5,
    calories: 1850,
    heartRate: 72,
    workouts: 2,
  })
  
  useEffect(() => {
    if (shouldReduceMotion) return
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        steps: Math.min(prev.steps + Math.floor(Math.random() * 8), goals.steps),
        heartRate: 68 + Math.floor(Math.random() * 12),
        calories: Math.min(prev.calories + Math.floor(Math.random() * 5), goals.calories),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [shouldReduceMotion, goals])

  const metrics = useMemo(() => [
    {
      id: 'steps',
      icon: Activity,
      label: 'Steps',
      value: stats.steps,
      goal: goals.steps,
      color: 'emerald',
      unit: '',
    },
    {
      id: 'water',
      icon: Droplet,
      label: 'Water',
      value: stats.water,
      goal: goals.water,
      color: 'blue',
      unit: ' glasses',
    },
    {
      id: 'sleep',
      icon: Moon,
      label: 'Sleep',
      value: stats.sleep,
      goal: goals.sleep,
      color: 'purple',
      unit: 'h',
    },
    {
      id: 'calories',
      icon: Flame,
      label: 'Calories',
      value: stats.calories,
      goal: goals.calories,
      color: 'orange',
      unit: '',
    },
  ], [stats, goals])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Health Metrics</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Settings2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-white/5 grid grid-cols-2 gap-3"
          >
            {metrics.map((metric) => (
              <div key={metric.id}>
                <label className="text-xs text-muted-foreground">{metric.label} Goal</label>
                <input
                  type="number"
                  value={goals[metric.id as keyof typeof goals]}
                  onChange={(e) => setGoals(prev => ({ ...prev, [metric.id]: Number(e.target.value) }))}
                  className="w-full px-2 py-1 rounded bg-white/10 text-white text-sm mt-1 border-none focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const percentage = Math.min((metric.value / metric.goal) * 100, 100)
          const colorMap = {
            emerald: '#10b981',
            blue: '#3b82f6',
            purple: '#a855f7',
            orange: '#f97316',
          }
          
          return (
            <WidgetCard
              key={metric.id}
              worldColor={worldColor}
              isCustomizable={false}
            >
              <metric.icon className={`w-5 h-5 text-${metric.color}-400 mb-2`} />
              <p className="text-2xl font-bold text-white">{metric.value.toLocaleString()}{metric.unit}</p>
              <p className="text-xs text-muted-foreground mb-2">/ {metric.goal.toLocaleString()}{metric.unit}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: colorMap[metric.color as keyof typeof colorMap] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: shouldReduceMotion ? 0.1 : 1, delay: index * 0.1 }}
                />
              </div>
            </WidgetCard>
          )
        })}
      </div>
    </div>
  )
})

HealthWidgets.displayName = 'HealthWidgets'

const CreativeWidgets = memo(({ worldColor }: { worldColor: string }) => {
  const projects = useMemo(() => [
    { name: 'Album Cover Design', progress: 75, color: '#ec4899' },
    { name: 'Website Mockup', progress: 40, color: '#8b5cf6' },
    { name: 'Logo Concepts', progress: 90, color: '#06b6d4' },
  ], [])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Creative Projects</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {projects.map((project) => (
          <WidgetCard
            key={project.name}
            worldColor={worldColor}
            isCustomizable={false}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brush className="w-4 h-4" style={{ color: project.color }} />
              <span className="font-medium text-white text-sm truncate">{project.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: project.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-sm font-medium text-white">{project.progress}%</span>
            </div>
          </WidgetCard>
        ))}
      </div>
    </div>
  )
})

CreativeWidgets.displayName = 'CreativeWidgets'

const EducationWidgets = memo(({ worldColor }: { worldColor: string }) => {
  const courses = useMemo(() => [
    { name: 'Machine Learning', progress: 65, lessons: 24 },
    { name: 'React Advanced', progress: 88, lessons: 18 },
  ], [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <WidgetCard worldColor={worldColor} isCustomizable={false}>
        <Trophy className="w-5 h-5 text-amber-400 mb-2" />
        <p className="text-3xl font-bold text-white">14 days</p>
        <p className="text-xs text-muted-foreground mt-1">Study Streak 🔥</p>
      </WidgetCard>

      <WidgetCard worldColor={worldColor} isCustomizable={false}>
        <BookOpen className="w-5 h-5 text-blue-400 mb-2" />
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-white/80 truncate">{course.name}</span>
                <span className="text-muted-foreground">{course.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: worldColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </WidgetCard>
    </div>
  )
})

EducationWidgets.displayName = 'EducationWidgets'

const SocialWidgets = memo(({ worldColor }: { worldColor: string }) => {
  const stats = useMemo(() => [
    { icon: Users, value: 12, label: 'Upcoming meetups', color: 'text-blue-400' },
    { icon: MessageCircle, value: 5, label: 'Pending replies', color: 'text-emerald-400' },
    { icon: Heart, value: 3, label: 'Birthdays this week', color: 'text-pink-400' },
  ], [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <WidgetCard key={stat.label} worldColor={worldColor} isCustomizable={false}>
          <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </WidgetCard>
      ))}
    </div>
  )
})

SocialWidgets.displayName = 'SocialWidgets'

const GamingWidgets = memo(({ worldColor }: { worldColor: string }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <WidgetCard worldColor={worldColor} isCustomizable={false}>
        <Gamepad2 className="w-5 h-5 text-purple-400 mb-2" />
        <p className="text-lg font-bold text-white">Elden Ring</p>
        <p className="text-xs text-muted-foreground mb-2">142 hours played</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '68%' }}
              transition={{ duration: 1 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">68%</span>
        </div>
      </WidgetCard>

      <WidgetCard worldColor={worldColor} isCustomizable={false}>
        <Trophy className="w-5 h-5 text-amber-400 mb-2" />
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">47</p>
            <p className="text-xs text-muted-foreground">Unlocked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">12</p>
            <p className="text-xs text-muted-foreground">Rare</p>
          </div>
        </div>
      </WidgetCard>
    </div>
  )
})

GamingWidgets.displayName = 'GamingWidgets'

export default function WorldWidgets({ worldType, worldColor }: WorldWidgetsProps) {
  if (worldType === 'general' || worldType === 'finance') {
    return null
  }

  const getWidgetTitle = () => {
    const titles = {
      development: 'Development Dashboard',
      health: 'Health Tracker',
      creative: 'Creative Projects',
      education: 'Learning Progress',
      social: 'Social Overview',
      gaming: 'Gaming Stats',
    }
    return titles[worldType] || 'Dashboard'
  }

  const getWidgetIcon = () => {
    const icons = {
      development: <Code2 className="w-5 h-5 text-white" />,
      health: <Heart className="w-5 h-5 text-white" />,
      creative: <Palette className="w-5 h-5 text-white" />,
      education: <BookOpen className="w-5 h-5 text-white" />,
      social: <Users className="w-5 h-5 text-white" />,
      gaming: <Gamepad2 className="w-5 h-5 text-white" />,
    }
    return icons[worldType] || null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${worldColor}, ${worldColor}80)` }}
        >
          {getWidgetIcon()}
        </div>
        <h2 className="font-semibold text-white">{getWidgetTitle()}</h2>
      </div>

      {worldType === 'development' && <DevelopmentWidgets worldColor={worldColor} />}
      {worldType === 'health' && <HealthWidgets worldColor={worldColor} />}
      {worldType === 'creative' && <CreativeWidgets worldColor={worldColor} />}
      {worldType === 'education' && <EducationWidgets worldColor={worldColor} />}
      {worldType === 'social' && <SocialWidgets worldColor={worldColor} />}
      {worldType === 'gaming' && <GamingWidgets worldColor={worldColor} />}
    </motion.div>
  )
}
