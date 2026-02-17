import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Volumetric nebula shader
const nebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const nebulaFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Fractal Brownian Motion noise
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
  
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec3 pos = vPosition * 0.008;
    float t = uTime * 0.02;
    
    // Multiple noise layers for volumetric effect
    float n1 = fbm(pos + vec3(t, 0.0, t * 0.5), 5);
    float n2 = fbm(pos * 1.5 + vec3(0.0, t * 0.3, 0.0), 4);
    float n3 = fbm(pos * 0.5 + vec3(t * 0.2, t * 0.1, t * 0.3), 6);
    
    // Combine noise for density
    float density = (n1 + n2 * 0.5 + n3 * 0.3) * 0.5 + 0.5;
    density = pow(density, 1.5);
    
    // Color mixing based on density
    vec3 color = mix(uColor1, uColor2, density);
    color = mix(color, uColor3, pow(density, 2.0) * 0.6);
    
    // Add subtle glow at edges
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    color += uColor2 * fresnel * 0.2;
    
    // Vary alpha based on density
    float alpha = density * uOpacity * (0.7 + fresnel * 0.3);
    alpha = clamp(alpha, 0.0, uOpacity);
    
    gl_FragColor = vec4(color, alpha);
  }
`

interface NebulaCloudProps {
  position: [number, number, number]
  scale: number
  colors: [string, string, string]
  opacity?: number
  rotationSpeed?: number
}

function NebulaCloud({ 
  position, 
  scale, 
  colors, 
  opacity = 0.3,
  rotationSpeed = 0.0001
}: NebulaCloudProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(colors[0]) },
    uColor2: { value: new THREE.Color(colors[1]) },
    uColor3: { value: new THREE.Color(colors[2]) },
    uOpacity: { value: opacity },
  }), [colors, opacity])

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime
      meshRef.current.rotation.y += rotationSpeed
      meshRef.current.rotation.x += rotationSpeed * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

interface NebulaProps {
  intensity?: number
}

export default function Nebula({ intensity = 1 }: NebulaProps) {
  // Define multiple nebula clouds for rich cosmic atmosphere
  const nebulaClouds = useMemo(() => [
    // Main purple/blue nebula - background
    {
      position: [-200, 80, -300] as [number, number, number],
      scale: 180,
      colors: ['#1a0533', '#2d1b4e', '#4a2c7a'] as [string, string, string],
      opacity: 0.25 * intensity,
      rotationSpeed: 0.00005,
    },
    // Secondary pink/magenta nebula
    {
      position: [250, -50, -280] as [number, number, number],
      scale: 150,
      colors: ['#2a0a2a', '#4a1545', '#6b2060'] as [string, string, string],
      opacity: 0.2 * intensity,
      rotationSpeed: 0.00008,
    },
    // Blue emission nebula
    {
      position: [100, 120, -350] as [number, number, number],
      scale: 200,
      colors: ['#0a1a2a', '#1a3050', '#2a4570'] as [string, string, string],
      opacity: 0.22 * intensity,
      rotationSpeed: 0.00004,
    },
    // Warm orange/red nebula - distant
    {
      position: [-150, -100, -400] as [number, number, number],
      scale: 120,
      colors: ['#2a1a0a', '#4a2a10', '#6b3a15'] as [string, string, string],
      opacity: 0.18 * intensity,
      rotationSpeed: 0.00006,
    },
    // Teal/cyan accent nebula
    {
      position: [0, 150, -320] as [number, number, number],
      scale: 100,
      colors: ['#0a2a2a', '#154545', '#206060'] as [string, string, string],
      opacity: 0.15 * intensity,
      rotationSpeed: 0.00007,
    },
  ], [intensity])

  return (
    <group>
      {nebulaClouds.map((cloud, i) => (
        <NebulaCloud key={i} {...cloud} />
      ))}
      
      {/* Ambient nebula glow - very subtle overall tint */}
      <mesh position={[0, 0, -500]} scale={600}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#1a0a2a"
          transparent
          opacity={0.1 * intensity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
