import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AsteroidData {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: number
  orbitRadius: number
  orbitSpeed: number
  orbitOffset: number
  tumbleSpeed: THREE.Vector3
  color: string
}

interface AsteroidsProps {
  count?: number
  beltRadius?: number
  beltWidth?: number
  beltHeight?: number
}

// Asteroid geometry variations for visual diversity
function createAsteroidGeometry(seed: number): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(1, 1)
  const positions = geometry.attributes.position
  
  // Deform vertices for irregular asteroid shape
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    const z = positions.getZ(i)
    
    // Use seed for consistent randomness
    const noise = Math.sin(x * 5 + seed) * Math.cos(y * 5 + seed) * Math.sin(z * 5 + seed)
    const deformation = 0.7 + noise * 0.4
    
    positions.setX(i, x * deformation)
    positions.setY(i, y * deformation)
    positions.setZ(i, z * deformation)
  }
  
  geometry.computeVertexNormals()
  return geometry
}

export default function Asteroids({ 
  count = 150, 
  beltRadius = 80, 
  beltWidth = 25,
  beltHeight = 8 
}: AsteroidsProps) {
  const groupRef = useRef<THREE.Group>(null)
  const asteroidsRef = useRef<THREE.InstancedMesh>(null)

  // Generate asteroid data
  const asteroidData = useMemo(() => {
    const data: AsteroidData[] = []
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const radiusOffset = (Math.random() - 0.5) * beltWidth
      const radius = beltRadius + radiusOffset
      const height = (Math.random() - 0.5) * beltHeight
      
      // Determine size - mostly small, few large
      const sizeRoll = Math.random()
      let scale: number
      if (sizeRoll < 0.7) scale = 0.2 + Math.random() * 0.3 // Small
      else if (sizeRoll < 0.95) scale = 0.5 + Math.random() * 0.5 // Medium
      else scale = 1 + Math.random() * 1.5 // Large (rare)
      
      // Color variations - rocky grays and browns
      const colorOptions = [
        '#4a4a4a', '#5c5c5c', '#6b6b6b', '#3d3d3d',
        '#4a3c32', '#5c4a3a', '#6b5a4a', '#3d3228'
      ]
      
      data.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        scale,
        orbitRadius: radius,
        orbitSpeed: 0.02 + Math.random() * 0.03,
        orbitOffset: angle,
        tumbleSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)]
      })
    }
    
    return data
  }, [count, beltRadius, beltWidth, beltHeight])

  // Stray asteroids that float independently
  const strayAsteroids = useMemo(() => {
    const strays: AsteroidData[] = []
    const strayCount = 20
    
    for (let i = 0; i < strayCount; i++) {
      const distance = 30 + Math.random() * 100
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 60
      
      strays.push({
        position: new THREE.Vector3(
          Math.cos(angle) * distance,
          height,
          Math.sin(angle) * distance
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        scale: 0.3 + Math.random() * 0.8,
        orbitRadius: distance,
        orbitSpeed: 0.005 + Math.random() * 0.01,
        orbitOffset: angle,
        tumbleSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        color: '#5c5c5c'
      })
    }
    
    return strays
  }, [])

  // Create varied geometries for visual interest
  const asteroidGeometries = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => createAsteroidGeometry(i * 123))
  }, [])

  // Dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const time = state.clock.elapsedTime * 0.1

    if (asteroidsRef.current) {
      asteroidData.forEach((asteroid, i) => {
        // Orbital movement
        const currentAngle = asteroid.orbitOffset + time * asteroid.orbitSpeed
        const x = Math.cos(currentAngle) * asteroid.orbitRadius
        const z = Math.sin(currentAngle) * asteroid.orbitRadius
        
        dummy.position.set(x, asteroid.position.y, z)
        
        // Tumbling rotation
        dummy.rotation.x = asteroid.rotation.x + time * asteroid.tumbleSpeed.x * 10
        dummy.rotation.y = asteroid.rotation.y + time * asteroid.tumbleSpeed.y * 10
        dummy.rotation.z = asteroid.rotation.z + time * asteroid.tumbleSpeed.z * 10
        
        dummy.scale.setScalar(asteroid.scale)
        dummy.updateMatrix()
        
        asteroidsRef.current!.setMatrixAt(i, dummy.matrix)
      })
      
      asteroidsRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* Instanced asteroid belt - efficient rendering */}
      <instancedMesh 
        ref={asteroidsRef} 
        args={[asteroidGeometries[0], undefined, count]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#5a5a5a"
          roughness={0.9}
          metalness={0.1}
          flatShading
        />
      </instancedMesh>

      {/* Stray asteroids with individual meshes for detail */}
      {strayAsteroids.map((asteroid, i) => (
        <mesh
          key={`stray-${i}`}
          position={asteroid.position}
          rotation={asteroid.rotation}
          scale={asteroid.scale}
          geometry={asteroidGeometries[i % asteroidGeometries.length]}
        >
          <meshStandardMaterial
            color={asteroid.color}
            roughness={0.95}
            metalness={0.05}
            flatShading
          />
        </mesh>
      ))}

      {/* Dust particles around asteroid belt */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500}
            array={useMemo(() => {
              const positions = new Float32Array(500 * 3)
              for (let i = 0; i < 500; i++) {
                const angle = Math.random() * Math.PI * 2
                const radius = beltRadius - beltWidth / 2 + Math.random() * beltWidth
                const height = (Math.random() - 0.5) * beltHeight * 2
                positions[i * 3] = Math.cos(angle) * radius
                positions[i * 3 + 1] = height
                positions[i * 3 + 2] = Math.sin(angle) * radius
              }
              return positions
            }, [beltRadius, beltWidth, beltHeight])}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#888888"
          size={0.3}
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
