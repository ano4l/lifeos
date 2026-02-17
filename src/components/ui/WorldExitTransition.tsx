import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface WorldExitTransitionProps {
  isActive: boolean
  worldColor: string
  onComplete?: () => void
}

export default function WorldExitTransition({ 
  isActive, 
  worldColor,
  onComplete 
}: WorldExitTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'lift' | 'ascend' | 'complete'>('idle')

  useEffect(() => {
    if (isActive) {
      setPhase('lift')
      
      // Phase 1: Lift off from world (0-400ms)
      const ascendTimer = setTimeout(() => setPhase('ascend'), 400)
      
      // Phase 2: Ascend to galaxy view (400-1000ms)
      const completeTimer = setTimeout(() => {
        setPhase('complete')
        onComplete?.()
      }, 1000)

      return () => {
        clearTimeout(ascendTimer)
        clearTimeout(completeTimer)
      }
    } else {
      setPhase('idle')
    }
  }, [isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Phase 1: Lift off - world shrinks away */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={phase === 'lift' || phase === 'ascend' ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* World surface fading below */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(0deg, ${worldColor}60 0%, ${worldColor}20 30%, transparent 60%)`,
              }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* Atmosphere glow as we leave */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1/3"
              style={{
                background: `radial-gradient(ellipse at bottom, ${worldColor}40 0%, transparent 70%)`,
              }}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>

          {/* Phase 2: Ascend - stars rushing past */}
          <AnimatePresence>
            {phase === 'ascend' && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Star streaks moving downward */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = Math.random() * 100
                  const delay = Math.random() * 0.3
                  const duration = 0.3 + Math.random() * 0.2
                  const size = 1 + Math.random() * 2
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        left: `${x}%`,
                        top: '-5%',
                        width: size,
                        height: '20px',
                        background: `linear-gradient(180deg, white 0%, ${worldColor}50 50%, transparent 100%)`,
                      }}
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ 
                        y: '120vh',
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration,
                        delay,
                        ease: 'linear',
                      }}
                    />
                  )
                })}

                {/* Central vignette */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final fade to black then reveal galaxy */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={phase === 'complete' ? { opacity: [0.8, 0] } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
