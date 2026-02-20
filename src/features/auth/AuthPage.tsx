import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccessMsg('Check your email to confirm your account.')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      }
    }

    setLoading(false)
  }

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4"
      style={{ background: '#050508' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">LifeOS</h1>
          <p className="text-white/40 text-sm">
            {isSignUp ? 'Create your universe' : 'Welcome back'}
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 20, 30, 0.95), rgba(8, 10, 18, 0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all text-sm"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all text-sm"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs px-1"
            >
              {error}
            </motion.p>
          )}

          {successMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-emerald-400 text-xs px-1"
            >
              {successMsg}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #6366f1cc)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            }}
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-white/30 text-sm mt-5">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setSuccessMsg(null)
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
