import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Moon surface shader for realistic cratered appearance
const moonVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const moonFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uCraterColor;
  uniform vec3 uHighlightColor;
  uniform vec3 uLightDirection;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Noise functions for crater generation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  float crater(vec3 p, float size) {
    float d = length(p);
    float rim = smoothstep(size * 0.8, size, d) * (1.0 - smoothstep(size, size * 1.2, d));
    float floor = 1.0 - smoothstep(0.0, size * 0.7, d);
    return rim * 0.3 - floor * 0.2;
  }
  
  void main() {
    vec3 pos = vPosition * 3.0;
    
    // Base noise for surface variation
    float baseNoise = snoise(pos * 2.0) * 0.5 + 0.5;
    float detailNoise = snoise(pos * 8.0) * 0.2;
    
    // Crater patterns at different scales
    float craterLarge = snoise(pos * 1.5) * 0.5 + 0.5;
    float craterMedium = snoise(pos * 4.0) * 0.5 + 0.5;
    float craterSmall = snoise(pos * 10.0) * 0.5 + 0.5;
    
    // Combine for surface detail
    float surface = baseNoise * 0.6 + detailNoise;
    surface += craterLarge * 0.15;
    surface += craterMedium * 0.1;
    surface += craterSmall * 0.05;
    
    // Color mixing
    vec3 color = mix(uCraterColor, uBaseColor, surface);
    color = mix(color, uHighlightColor, pow(surface, 3.0) * 0.3);
    
    // Lighting
    float diffuse = max(dot(vNormal, normalize(uLightDirection)), 0.0);
    float ambient = 0.15;
    
    // Terminator softening
    float terminator = smoothstep(-0.1, 0.3, diffuse);
    
    vec3 finalColor = color * (ambient + diffuse * 0.85 * terminator);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export interface MoonData {
  id: string
  name: string
  color?: string
  size?: number
  orbitRadius?: number
  orbitSpeed?: number
}

interface MoonProps {
  moon: MoonData
  parentPosition: [number, number, number]
  index: number
  totalMoons: number
  isParentHovered: boolean
  onClick?: () => void
}

export default function Moon({ 
  moon, 
  parentPosition, 
  index, 
  totalMoons, 
  isParentHovered,
  onClick 
}: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Moon properties based on index and data
  const moonProps = useMemo(() => {
    const baseOrbitRadius = moon.orbitRadius || 4 + index * 1.5
    const baseSize = moon.size || 0.3 + Math.random() * 0.3
    const orbitSpeed = moon.orbitSpeed || 0.5 + Math.random() * 0.5
    const orbitTilt = (index / Math.max(totalMoons, 1)) * 0.3
    const initialAngle = (index / totalMoons) * Math.PI * 2
    
    // Moon colors - various gray tones with slight color tints
    const colorOptions = [
      { base: '#a0a0a0', crater: '#707070', highlight: '#d0d0d0' },
      { base: '#b0a090', crater: '#807060', highlight: '#d0c0b0' },
      { base: '#90a0a0', crater: '#607070', highlight: '#b0c0c0' },
      { base: '#a09080', crater: '#706050', highlight: '#c0b0a0' },
    ]
    const colors = colorOptions[index % colorOptions.length]
    
    return {
      orbitRadius: baseOrbitRadius,
      size: baseSize,
      orbitSpeed,
      orbitTilt,
      initialAngle,
      colors,
    }
  }, [moon, index, totalMoons])

  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(moonProps.colors.base) },
    uCraterColor: { value: new THREE.Color(moonProps.colors.crater) },
    uHighlightColor: { value: new THREE.Color(moonProps.colors.highlight) },
    uLightDirection: { value: new THREE.Vector3(1, 0.5, 0.5).normalize() },
  }), [moonProps.colors])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (groupRef.current) {
      // Orbital motion
      const angle = moonProps.initialAngle + time * moonProps.orbitSpeed * 0.1
      const x = Math.cos(angle) * moonProps.orbitRadius
      const z = Math.sin(angle) * moonProps.orbitRadius
      const y = Math.sin(angle * 2) * moonProps.orbitTilt
      
      groupRef.current.position.set(
        parentPosition[0] + x,
        parentPosition[1] + y,
        parentPosition[2] + z
      )
    }

    if (moonRef.current) {
      // Tidal locking simulation - slow rotation
      moonRef.current.rotation.y += 0.002
      
      // Update shader time
      const material = moonRef.current.material as THREE.ShaderMaterial
      if (material.uniforms) {
        material.uniforms.uTime.value = time
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Moon body with detailed surface */}
      <mesh 
        ref={moonRef} 
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[moonProps.size, 32, 32]} />
        <shaderMaterial
          vertexShader={moonVertexShader}
          fragmentShader={moonFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Subtle glow when parent is hovered */}
      {isParentHovered && (
        <mesh scale={1.3}>
          <sphereGeometry args={[moonProps.size, 16, 16]} />
          <meshBasicMaterial
            color={moonProps.colors.highlight}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Moon label - only visible when parent is hovered */}
      {isParentHovered && (
        <Html
          position={[0, moonProps.size + 0.5, 0]}
          center
          distanceFactor={25}
          style={{
            transition: 'opacity 0.3s ease',
            opacity: 1,
          }}
        >
          <div className="pointer-events-none select-none">
            <div
              className="px-2 py-1 rounded-lg backdrop-blur-md border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <p className="text-white/80 text-xs whitespace-nowrap">
                {moon.name}
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Orbit ring visualization
interface MoonOrbitProps {
  parentPosition: [number, number, number]
  radius: number
  tilt?: number
  opacity?: number
}

export function MoonOrbit({ parentPosition, radius, tilt = 0, opacity = 0.15 }: MoonOrbitProps) {
  return (
    <mesh 
      position={parentPosition} 
      rotation={[Math.PI / 2 + tilt, 0, 0]}
    >
      <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
