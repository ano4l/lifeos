import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import LoadingScreen from '@/components/ui/LoadingScreen'

const GodView = lazy(() => import('@/features/god-view/GodView'))
const WorldView = lazy(() => import('@/features/world-view/WorldView'))
const DashboardView = lazy(() => import('@/features/dashboard/DashboardView'))

export default function App() {
  return (
    <div className="min-h-screen bg-cosmos-void overflow-hidden">
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<GodView />} />
            <Route path="/world/:worldId" element={<WorldView />} />
            <Route path="/dashboard" element={<DashboardView />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  )
}
