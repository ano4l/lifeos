/**
 * CINEMATIC LIGHT LEAK / GLOW WASH EFFECT
 * ========================================
 * 
 * Inspired by x.ai homepage - premium, calm, intelligent aesthetic.
 * 
 * HOW THE ILLUSION WORKS:
 * -----------------------
 * 1. Two large, heavily blurred gradient layers create soft organic light blooms
 * 2. CSS transforms (translate) move layers slowly using GPU acceleration
 * 3. Opacity "breathing" creates subtle pulsing without geometry changes
 * 4. Screen/additive-like effect via light colors on dark background
 * 5. Heavy blur (80-120px) fakes atmospheric depth and refraction
 * 6. Asymmetric positioning biases light to one side for realism
 * 
 * PERFORMANCE CONSIDERATIONS:
 * ---------------------------
 * - Only 2 DOM elements for the effect (minimal)
 * - CSS animations run on compositor thread (GPU accelerated)
 * - No JavaScript animation loop - pure CSS keyframes
 * - will-change hints for optimal layer promotion
 * - No particles, physics, or complex calculations
 * - Blur is applied once to static gradients, not per-frame
 * 
 * ADJUSTABLE PARAMETERS:
 * ----------------------
 * - intensity: 'subtle' | 'medium' | 'intense' - controls opacity and blur
 * - speed: 'slow' | 'normal' | 'fast' - animation duration
 * - color: primary color for the glow (cool blues recommended)
 * - bias: 'left' | 'right' | 'center' - light source position
 */

import { CSSProperties } from 'react'

interface LightLeakProps {
  /** Intensity of the glow effect */
  intensity?: 'subtle' | 'medium' | 'intense'
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast'
  /** Primary glow color */
  color?: string
  /** Secondary accent color for temperature variation */
  accentColor?: string
  /** Light source bias position */
  bias?: 'left' | 'right' | 'center'
  /** Additional CSS classes */
  className?: string
}

export default function LightLeak({
  intensity = 'medium',
  speed = 'normal',
  color = 'rgba(100, 170, 255, 0.4)',
  accentColor = 'rgba(180, 210, 255, 0.25)',
  bias = 'right',
  className = '',
}: LightLeakProps) {
  
  // Intensity presets - opacity and blur levels
  const intensityConfig = {
    subtle: { opacity: 0.3, blur: 100 },
    medium: { opacity: 0.5, blur: 90 },
    intense: { opacity: 0.7, blur: 80 },
  }

  // Speed presets - animation durations in seconds
  const speedConfig = {
    slow: { primary: 40, secondary: 50 },
    normal: { primary: 25, secondary: 32 },
    fast: { primary: 15, secondary: 20 },
  }

  // Bias positions for light source
  const biasConfig = {
    left: { primary: '-20%', secondary: '10%' },
    right: { primary: '50%', secondary: '70%' },
    center: { primary: '20%', secondary: '40%' },
  }

  const config = intensityConfig[intensity]
  const timing = speedConfig[speed]
  const position = biasConfig[bias]

  // Primary glow layer styles
  const primaryStyle: CSSProperties = {
    position: 'absolute',
    top: '-30%',
    left: position.primary,
    width: '80%',
    height: '80%',
    background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${color} 0%, transparent 70%)`,
    filter: `blur(${config.blur}px)`,
    opacity: config.opacity,
    willChange: 'transform, opacity',
    animation: `lightLeakPrimary ${timing.primary}s ease-in-out infinite`,
    pointerEvents: 'none',
  }

  // Secondary glow layer styles - offset for depth
  const secondaryStyle: CSSProperties = {
    position: 'absolute',
    top: '20%',
    left: position.secondary,
    width: '60%',
    height: '60%',
    background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${accentColor} 0%, transparent 70%)`,
    filter: `blur(${config.blur + 20}px)`,
    opacity: config.opacity * 0.7,
    willChange: 'transform, opacity',
    animation: `lightLeakSecondary ${timing.secondary}s ease-in-out infinite`,
    pointerEvents: 'none',
  }

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Primary glow - main light source */}
      <div style={primaryStyle} />
      
      {/* Secondary glow - accent/temperature variation */}
      <div style={secondaryStyle} />

      {/* CSS Keyframes injected via style tag */}
      <style>{`
        @keyframes lightLeakPrimary {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
            opacity: ${config.opacity};
          }
          25% {
            transform: translate(5%, 8%) scale(1.05);
            opacity: ${config.opacity * 1.2};
          }
          50% {
            transform: translate(-3%, 5%) scale(0.98);
            opacity: ${config.opacity * 0.8};
          }
          75% {
            transform: translate(8%, -3%) scale(1.02);
            opacity: ${config.opacity * 1.1};
          }
        }

        @keyframes lightLeakSecondary {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
            opacity: ${config.opacity * 0.7};
          }
          33% {
            transform: translate(-8%, 5%) scale(1.08);
            opacity: ${config.opacity * 0.9};
          }
          66% {
            transform: translate(5%, -8%) scale(0.95);
            opacity: ${config.opacity * 0.5};
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Compact accent glow for cards and UI elements
 * Uses CSS-only animation for maximum performance
 */
export function LightLeakAccent({
  position = 'top-right',
  color = 'rgba(100, 180, 255, 0.3)',
  size = 'medium',
  className = '',
}: {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  color?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}) {
  const positionStyles: Record<string, CSSProperties> = {
    'top-right': { top: '-30%', right: '-30%' },
    'top-left': { top: '-30%', left: '-30%' },
    'bottom-right': { bottom: '-30%', right: '-30%' },
    'bottom-left': { bottom: '-30%', left: '-30%' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  }

  const sizeConfig = {
    small: { size: '50%', blur: 40 },
    medium: { size: '70%', blur: 60 },
    large: { size: '90%', blur: 80 },
  }

  const config = sizeConfig[size]
  const id = `accent-${position}-${size}`

  return (
    <>
      <div
        className={`absolute rounded-full pointer-events-none ${className}`}
        style={{
          ...positionStyles[position],
          width: config.size,
          height: config.size,
          background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
          filter: `blur(${config.blur}px)`,
          animation: `accentBreath-${id} 8s ease-in-out infinite`,
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      />
      <style>{`
        @keyframes accentBreath-${id} {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </>
  )
}

/**
 * Subtle animated border glow
 * Pure CSS animation, no JS required
 */
export function LightLeakBorder({
  color = 'rgba(100, 180, 255, 0.4)',
  duration = 4,
  className = '',
}: {
  color?: string
  duration?: number
  className?: string
}) {
  return (
    <>
      <div
        className={`absolute inset-0 rounded-inherit pointer-events-none ${className}`}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, transparent 40%, transparent 60%, ${color} 100%)`,
          animation: `borderGlow ${duration}s ease-in-out infinite`,
          willChange: 'opacity',
        }}
        aria-hidden="true"
      />
      <style>{`
        @keyframes borderGlow {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}
