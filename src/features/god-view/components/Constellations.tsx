import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

interface Star {
  position: THREE.Vector3
  brightness: number
  size: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface Constellation {
  name: string
  stars: THREE.Vector3[]
  connections: [number, number][]
  position: THREE.Vector3
  scale: number
}

// Famous constellation patterns adapted for our cosmic scene
const constellationData = [
  {
    name: 'Orion',
    stars: [
      [0, 0, 0], [3, 0.5, 0], [6, 0, 0], // Belt
      [1.5, 4, 0], [4.5, 4, 0], // Shoulders
      [3, 7, 0], // Head
      [0, -4, 0], [6, -4, 0], // Feet
    ],
    connections: [[0, 1], [1, 2], [0, 6], [2, 7], [3, 4], [3, 0], [4, 2], [3, 5], [4, 5]],
    offset: [0, 0, -400],
    scale: 8,
  },
  {
    name: 'Ursa Major',
    stars: [
      [0, 0, 0], [4, 1, 0], [8, 0.5, 0], [12, 2, 0], // Bowl
      [14, 5, 0], [18, 7, 0], [22, 6, 0], // Handle
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
    offset: [-150, 100, -380],
    scale: 6,
  },
  {
    name: 'Cassiopeia',
    stars: [
      [0, 0, 0], [5, 4, 0], [10, 1, 0], [15, 5, 0], [20, 2, 0],
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4]],
    offset: [180, 120, -420],
    scale: 5,
  },
  {
    name: 'Cygnus',
    stars: [
      [0, 0, 0], [4, 0, 0], [8, 0, 0], [12, 0, 0], // Cross horizontal
      [4, -4, 0], [4, 4, 0], // Cross vertical
      [2, -2, 0], [6, 2, 0], // Wings
    ],
    connections: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5], [4, 6], [5, 7]],
    offset: [50, 80, -450],
    scale: 7,
  },
  {
    name: 'Scorpius',
    stars: [
      [0, 0, 0], [3, -2, 0], [6, -3, 0], [9, -2, 0], // Body
      [12, 0, 0], [14, 3, 0], [15, 6, 0], // Tail curve
      [16, 8, 0], [17, 7, 0], // Stinger
      [-3, 1, 0], [-2, 3, 0], // Claws
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [0, 9], [9, 10]],
    offset: [-200, -50, -400],
    scale: 5,
  },
  {
    name: 'Leo',
    stars: [
      [0, 0, 0], [4, 2, 0], [8, 3, 0], [12, 2, 0], // Back
      [8, -2, 0], [4, -3, 0], [0, -2, 0], // Belly
      [-3, 0, 0], [-5, 3, 0], // Head
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 7], [7, 8]],
    offset: [120, -80, -430],
    scale: 5,
  },
]

interface ConstellationsProps {
  opacity?: number
}

export default function Constellations({ opacity = 0.6 }: ConstellationsProps) {
  const groupRef = useRef<THREE.Group>(null)
  const starsRef = useRef<THREE.Points>(null)

  // Process constellation data
  const constellations = useMemo((): Constellation[] => {
    return constellationData.map(data => ({
      name: data.name,
      stars: data.stars.map(([x, y, z]) => 
        new THREE.Vector3(
          x * data.scale + data.offset[0],
          y * data.scale + data.offset[1],
          z * data.scale + data.offset[2]
        )
      ),
      connections: data.connections,
      position: new THREE.Vector3(...data.offset),
      scale: data.scale,
    }))
  }, [])

  // Generate all constellation stars with twinkling data
  const allStars = useMemo((): Star[] => {
    const stars: Star[] = []
    
    constellations.forEach(constellation => {
      constellation.stars.forEach((pos, i) => {
        // Main stars are brighter, connection stars dimmer
        const isMainStar = i < 4
        stars.push({
          position: pos,
          brightness: isMainStar ? 0.9 + Math.random() * 0.1 : 0.6 + Math.random() * 0.3,
          size: isMainStar ? 3 + Math.random() * 2 : 2 + Math.random() * 1.5,
          twinkleSpeed: 0.5 + Math.random() * 1.5,
          twinkleOffset: Math.random() * Math.PI * 2,
        })
      })
    })
    
    return stars
  }, [constellations])

  // Star positions for points geometry
  const starPositions = useMemo(() => {
    const positions = new Float32Array(allStars.length * 3)
    allStars.forEach((star, i) => {
      positions[i * 3] = star.position.x
      positions[i * 3 + 1] = star.position.y
      positions[i * 3 + 2] = star.position.z
    })
    return positions
  }, [allStars])

  // Star sizes
  const starSizes = useMemo(() => {
    return new Float32Array(allStars.map(star => star.size))
  }, [allStars])

  // Animation for twinkling
  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (starsRef.current) {
      const sizes = starsRef.current.geometry.attributes.size as THREE.BufferAttribute
      
      allStars.forEach((star, i) => {
        const twinkle = 0.7 + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3
        sizes.setX(i, star.size * twinkle * star.brightness)
      })
      
      sizes.needsUpdate = true
    }

    // Subtle group rotation for parallax
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.01) * 0.02
    }
  })

  // Get line points for constellation connections
  const getLinePoints = (constellation: Constellation, connection: [number, number]) => {
    const start = constellation.stars[connection[0]]
    const end = constellation.stars[connection[1]]
    return [start, end]
  }

  return (
    <group ref={groupRef}>
      {/* Constellation connection lines */}
      {constellations.map((constellation, cIndex) => (
        <group key={constellation.name}>
          {constellation.connections.map((connection, lIndex) => {
            const points = getLinePoints(constellation, connection)
            return (
              <Line
                key={`${cIndex}-${lIndex}`}
                points={points}
                color="#4a6fa5"
                lineWidth={0.5}
                transparent
                opacity={opacity * 0.3}
              />
            )
          })}
        </group>
      ))}

      {/* Constellation stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={allStars.length}
            array={starPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={allStars.length}
            array={starSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#a8c4e8"
          size={3}
          transparent
          opacity={opacity}
          sizeAttenuation
          vertexColors={false}
        />
      </points>

      {/* Additional background stars for depth */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2000}
            array={useMemo(() => {
              const positions = new Float32Array(2000 * 3)
              for (let i = 0; i < 2000; i++) {
                // Spherical distribution
                const radius = 350 + Math.random() * 150
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
                positions[i * 3 + 2] = radius * Math.cos(phi)
              }
              return positions
            }, [])}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={1.5}
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
