import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { useAuth } from '@/hooks/useAuth'
import AuthPage from '@/features/auth/AuthPage'

const GodView = lazy(() => import('@/features/god-view/GodView'))
const WorldView = lazy(() => import('@/features/world-view/WorldView'))
const MoonView = lazy(() => import('@/features/moon-view/MoonView'))
const DashboardView = lazy(() => import('@/features/dashboard/DashboardView'))

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-cosmos-void overflow-hidden">
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<GodView />} />
            <Route path="/world/:worldId" element={<WorldView />} />
            <Route path="/world/:worldId/moon/:moonId" element={<MoonView />} />
            <Route path="/dashboard" element={<DashboardView />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  )
}
