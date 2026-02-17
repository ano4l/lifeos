import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Planet from './Planet'
import type { World } from '@/types'

interface GalaxyProps {
  worlds: World[]
  onWorldClick: (worldId: string) => void
  onWorldHover: (worldId: string | null) => void
  hoveredWorld: string | null
}

interface OrbitData {
  radius: number
  speed: number
  angle: number
  inclination: number
}

export default function Galaxy({ 
  worlds, 
  onWorldClick, 
  onWorldHover, 
  hoveredWorld
}: GalaxyProps) {
  const orbitRingsRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Group>(null)
  
  const [orbitalAngles, setOrbitalAngles] = useState<number[]>([])
  
  useEffect(() => {
    if (orbitalAngles.length !== worlds.length) {
      setOrbitalAngles(worlds.map((_, i) => (i * Math.PI * 2) / Math.max(worlds.length, 1) + Math.random() * 0.5))
    }
  }, [worlds.length, orbitalAngles.length])
  
  const starField = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 200 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
    }
    
    return positions
  }, [])
  
  const orbitData = useMemo((): OrbitData[] => {
    // Predefined positions to avoid overlapping, inspired by reference image
    const positions = [
      { radius: 15, angle: 0, inclination: 0 },      // First planet - close, front
      { radius: 25, angle: Math.PI * 0.6, inclination: 0.1 },  // Second planet - medium distance, offset
      { radius: 35, angle: Math.PI * 1.2, inclination: -0.1 }, // Third planet - farther, opposite side
      { radius: 22, angle: Math.PI * 1.8, inclination: 0.15 }, // Fourth planet - medium, different angle
      { radius: 42, angle: Math.PI * 0.3, inclination: -0.05 }, // Fifth planet - far, spread out
      { radius: 30, angle: Math.PI * 1.5, inclination: 0.08 },  // Sixth planet - medium-far
    ]
    
    return worlds.map((_, index) => {
      const pos = positions[index] || { 
        radius: 20 + (index * 12), 
        angle: (index * Math.PI * 2) / Math.max(worlds.length, 1),
        inclination: (index % 2 === 0 ? 1 : -1) * (index * 0.1)
      }
      
      const speed = 0.05 / Math.sqrt(pos.radius / 20) // Very slow orbital speed
      const currentAngle = orbitalAngles[index] || pos.angle
      
      return { 
        radius: pos.radius, 
        speed, 
        angle: currentAngle, 
        inclination: pos.inclination 
      }
    })
  }, [worlds, orbitalAngles])

  useFrame((state: any) => {
    const delta = state.clock.getDelta()
    const time = state.clock.elapsedTime
    
    // Animate fiery core
    if (coreRef.current) {
      // Slow rotation
      coreRef.current.rotation.y += delta * 0.2
      // Subtle pulsing scale
      const pulse = 1 + Math.sin(time * 2) * 0.05
      coreRef.current.scale.setScalar(pulse)
    }
    
    setOrbitalAngles(prev => 
      prev.map((angle, i) => {
        const orbit = orbitData[i]
        if (!orbit) return angle
        return angle + orbit.speed * delta
      })
    )
  })

  const planetPositions = useMemo(() => {
    return orbitData.map((orbit, index) => {
      const currentAngle = orbitalAngles[index] || orbit.angle
      // Create elliptical orbits for better visual distribution
      const ellipseA = orbit.radius // Semi-major axis
      const ellipseB = orbit.radius * 0.7 // Semi-minor axis for elliptical shape
      
      const x = Math.cos(currentAngle) * ellipseA
      const z = Math.sin(currentAngle) * ellipseB
      const y = Math.sin(currentAngle * 0.5) * orbit.inclination * 3 // More pronounced inclination
      
      return [x, y, z] as [number, number, number]
    })
  }, [orbitData, orbitalAngles])

  return (
    <group>
      <ambientLight intensity={0.15} />
      <directionalLight position={[50, 30, 40]} intensity={1.2} color="#fff8f0" />
      <pointLight position={[-30, -20, -30]} intensity={0.4} color="#4488ff" />
      
      {/* Space background */}
      <mesh scale={[500, 500, 500]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#000308" side={THREE.BackSide} />
      </mesh>

      {/* Star field */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starField.length / 3}
            array={starField}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={1.5}
          transparent
          opacity={0.7}
          sizeAttenuation={true}
        />
      </points>

      {/* Clickable fiery core */}
      <group 
        ref={coreRef}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          // Navigate to dashboard
          window.location.href = '/dashboard'
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        {/* Core sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.5, 32, 32]} />
          <meshBasicMaterial 
            color="#ff4400" 
          />
        </mesh>
        
        {/* Inner fire glow */}
        <mesh position={[0, 0, 0]} scale={1.2}>
          <sphereGeometry args={[3.5, 24, 24]} />
          <meshBasicMaterial 
            color="#ff6600" 
            transparent 
            opacity={0.6}
          />
        </mesh>
        
        {/* Outer fire corona */}
        <mesh position={[0, 0, 0]} scale={1.5}>
          <sphereGeometry args={[3.5, 16, 16]} />
          <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={0.3}
          />
        </mesh>
        
        {/* Distant glow */}
        <mesh position={[0, 0, 0]} scale={2.2}>
          <sphereGeometry args={[3.5, 12, 12]} />
          <meshBasicMaterial 
            color="#ffcc44" 
            transparent 
            opacity={0.1}
          />
        </mesh>
      </group>

      {/* Orbital path rings - subtle guide lines */}
      <group ref={orbitRingsRef} rotation={[Math.PI / 2, 0, 0]}>
        {orbitData.map((orbit, index) => (
          <mesh key={`orbit-${index}`}>
            <ringGeometry args={[orbit.radius - 0.03, orbit.radius + 0.03, 128]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.04}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {worlds.map((world, index) => {
        const position = planetPositions[index]
        const orbit = orbitData[index]
        if (!position || !orbit) return null
        
        return (
          <Planet
            key={world.id}
            world={world}
            position={position}
            distance={orbit.radius}
            onClick={() => onWorldClick(world.id)}
            onHover={(hovered: boolean) => onWorldHover(hovered ? world.id : null)}
            isHovered={hoveredWorld === world.id}
          />
        )
      })}
    </group>
  )
}
