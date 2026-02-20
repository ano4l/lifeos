import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import type { World } from '@/types'

// Simplified planet shader - still looks great but lighter weight
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uTime;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
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
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    for(int i = 0; i < 5; i++) {
      value += amp * snoise(p);
      p *= 2.1;
      amp *= 0.48;
    }
    return value;
  }
  
  void main() {
    vec3 pos = vPosition * 2.0;
    vec3 lightDir = normalize(vec3(1.0, 0.5, 0.8));
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    
    // Surface noise
    float n1 = fbm(pos * 0.8) * 0.5 + 0.5;
    float n2 = fbm(pos * 1.5 + 50.0) * 0.5 + 0.5;
    
    // Color mixing
    vec3 color = mix(uColor1, uColor2, n1);
    color = mix(color, uColor3, n2 * 0.4);
    
    // Lighting
    float NdotL = max(dot(vNormal, lightDir), 0.0);
    float terminator = smoothstep(-0.05, 0.2, NdotL);
    
    // Fresnel rim
    float NdotV = max(dot(vNormal, viewDir), 0.0);
    float fresnel = pow(1.0 - NdotV, 3.0);
    vec3 rimColor = mix(uColor1, vec3(0.5, 0.7, 1.0), 0.5);
    
    // Compose
    vec3 ambient = color * 0.12;
    vec3 diffuse = color * NdotL * terminator * 0.85;
    vec3 rim = rimColor * fresnel * 0.4;
    
    vec3 final = ambient + diffuse + rim;
    final = final / (final + vec3(0.5)); // Tone map
    
    gl_FragColor = vec4(final, 1.0);
  }
`

function RotatingSphere({ colorTheme }: { colorTheme: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const colors = useMemo(() => {
    const base = new THREE.Color(colorTheme)
    const hsl = { h: 0, s: 0, l: 0 }
    base.getHSL(hsl)
    return {
      c1: base,
      c2: new THREE.Color().setHSL((hsl.h + 0.15) % 1, Math.min(hsl.s * 1.2, 1), hsl.l * 0.7),
      c3: new THREE.Color().setHSL((hsl.h + 0.3) % 1, Math.min(hsl.s * 0.8, 1), hsl.l * 0.5),
    }
  }, [colorTheme])

  const uniforms = useMemo(() => ({
    uColor1: { value: colors.c1 },
    uColor2: { value: colors.c2 },
    uColor3: { value: colors.c3 },
    uTime: { value: 0 },
  }), [colors])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      const mat = meshRef.current.material as THREE.ShaderMaterial
      if (mat.uniforms) {
        mat.uniforms.uTime.value = state.clock.elapsedTime
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 2, 4]} intensity={1.2} color="#fff8f0" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, 48, 48]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.42, 32, 32]} />
        <meshBasicMaterial
          color={colorTheme}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}

interface PlanetButtonProps {
  world: World
  index: number
  onClick: () => void
  taskCount: number
  urgentCount: number
  moonCount: number
}

export default function PlanetButton({ world, index, onClick, taskCount, urgentCount, moonCount }: PlanetButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group outline-none focus:outline-none active:scale-95 transition-transform duration-150"
    >
      {/* Planet sphere container */}
      <div 
        className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48"
        style={{ overflow: 'visible' }}
      >
        {/* Glow behind planet */}
        <div 
          className="absolute rounded-full opacity-30 group-hover:opacity-50 group-active:opacity-60 transition-opacity blur-2xl"
          style={{ 
            backgroundColor: world.colorTheme,
            inset: '-20%',
          }}
        />
        
        {/* 3D Planet Canvas */}
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 40 }}
          style={{ background: 'transparent', overflow: 'visible' }}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          dpr={[1, 2]}
        >
          <RotatingSphere colorTheme={world.colorTheme} />
        </Canvas>

        {/* Urgent badge */}
        {urgentCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
            <span className="text-white text-xs font-bold">{urgentCount}</span>
          </div>
        )}
      </div>

      {/* World name */}
      <div className="text-center max-w-[160px]">
        <p className="text-white text-base sm:text-lg font-semibold truncate">
          {world.name}
        </p>
        <p className="text-white/40 text-xs sm:text-sm">
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          {moonCount > 0 && (
            <span className="ml-1">&middot; {moonCount} {moonCount === 1 ? 'moon' : 'moons'}</span>
          )}
        </p>
      </div>
    </motion.button>
  )
}
