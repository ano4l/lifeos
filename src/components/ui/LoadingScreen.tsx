import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-cosmos-void flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cosmos-energy to-cosmos-glow"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ filter: 'blur(8px)' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-cosmos-void"
            animate={{ scale: [1, 0.95, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-cosmos-energy/50 to-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="font-display text-2xl font-semibold text-white mb-2">
            LifeOS
          </h2>
          <p className="text-muted-foreground text-sm">
            Initializing your universe...
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
