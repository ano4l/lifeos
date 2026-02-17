import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface WorldTransitionProps {
  isActive: boolean
  worldColor: string
  worldName: string
  onComplete?: () => void
}

export default function WorldTransition({ 
  isActive, 
  worldColor, 
  worldName,
  onComplete 
}: WorldTransitionProps) {
  useEffect(() => {
    if (isActive) {
      // Simple delay then complete
      const completeTimer = setTimeout(() => {
        onComplete?.()
      }, 1200)

      return () => {
        clearTimeout(completeTimer)
      }
    }
  }, [isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <motion.p
              className="text-white/50 text-xs uppercase tracking-[0.4em] mb-3"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Entering
            </motion.p>
            <motion.h1
              className="text-white text-4xl md:text-5xl font-display font-bold"
              style={{ 
                textShadow: `0 0 30px ${worldColor}80`,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
            >
              {worldName}
            </motion.h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
