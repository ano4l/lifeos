import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Solar flare vertex shader
const flareVertexShader = `
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

// Solar flare fragment shader - creates realistic plasma effect
const flareFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Simplex noise for organic movement
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
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec3 pos = vPosition * 0.5;
    float t = uTime * 0.15;
    
    // Multiple noise layers for complex plasma movement
    float n1 = fbm(pos + vec3(t * 0.5, 0.0, t * 0.3));
    float n2 = fbm(pos * 2.0 + vec3(0.0, t * 0.4, 0.0));
    float n3 = fbm(pos * 0.5 + vec3(t * 0.2, t * 0.1, 0.0));
    
    // Combine for plasma effect
    float plasma = (n1 + n2 * 0.5 + n3 * 0.25) * 0.5 + 0.5;
    
    // Color gradient from core to edge
    vec3 color = mix(uColor1, uColor2, plasma);
    color = mix(color, uColor3, pow(plasma, 2.0) * 0.5);
    
    // Intensity variation
    float intensity = 0.8 + plasma * 0.4;
    
    // Edge glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    color += uColor3 * fresnel * 0.3;
    
    gl_FragColor = vec4(color * intensity, 1.0);
  }
`

// Corona shader for outer glow
const coronaVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const coronaFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    float pulse = 0.8 + sin(uTime * 0.5) * 0.2;
    vec3 color = uColor * intensity * pulse;
    float alpha = intensity * 0.6;
    gl_FragColor = vec4(color, alpha);
  }
`

interface SunProps {
  position?: [number, number, number]
  size?: number
}

export default function Sun({ position = [0, 50, -150], size = 25 }: SunProps) {
  const sunRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const flare1Ref = useRef<THREE.Mesh>(null)
  const flare2Ref = useRef<THREE.Mesh>(null)
  const flare3Ref = useRef<THREE.Mesh>(null)

  // Sun surface uniforms
  const sunUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#FFF4E0') }, // Bright white-yellow core
    uColor2: { value: new THREE.Color('#FFB347') }, // Orange mid
    uColor3: { value: new THREE.Color('#FF6B35') }, // Deep orange edge
  }), [])

  // Corona uniforms
  const coronaUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#FFD700') },
  }), [])

  // Solar flare positions - dynamic eruptions
  const flareData = useMemo(() => [
    { scale: [0.3, 1.5, 0.3] as [number, number, number], rotation: 0, speed: 0.8 },
    { scale: [0.25, 1.2, 0.25] as [number, number, number], rotation: Math.PI * 0.6, speed: 1.2 },
    { scale: [0.35, 1.8, 0.35] as [number, number, number], rotation: Math.PI * 1.3, speed: 0.6 },
  ], [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Update shader uniforms
    if (sunRef.current) {
      const material = sunRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = time
      sunRef.current.rotation.y += 0.001
    }

    if (coronaRef.current) {
      const material = coronaRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = time
    }

    // Animate solar flares
    const flareRefs = [flare1Ref, flare2Ref, flare3Ref]
    flareRefs.forEach((ref, i) => {
      if (ref.current) {
        const data = flareData[i]
        // Pulsing scale for eruption effect
        const pulse = 1 + Math.sin(time * data.speed) * 0.3
        const heightPulse = 1 + Math.sin(time * data.speed * 0.5) * 0.5
        ref.current.scale.set(
          data.scale[0] * pulse,
          data.scale[1] * heightPulse,
          data.scale[2] * pulse
        )
        // Slight rotation wobble
        ref.current.rotation.z = data.rotation + Math.sin(time * 0.3) * 0.1
      }
    })
  })

  return (
    <group position={position}>
      {/* Main sun body with plasma shader */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <shaderMaterial
          vertexShader={flareVertexShader}
          fragmentShader={flareFragmentShader}
          uniforms={sunUniforms}
        />
      </mesh>

      {/* Inner corona glow */}
      <mesh ref={coronaRef} scale={1.15}>
        <sphereGeometry args={[size, 32, 32]} />
        <shaderMaterial
          vertexShader={coronaVertexShader}
          fragmentShader={coronaFragmentShader}
          uniforms={coronaUniforms}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer corona haze */}
      <mesh scale={1.5}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Extended glow */}
      <mesh scale={2.5}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Solar flares */}
      <mesh ref={flare1Ref} position={[size * 0.9, size * 0.3, 0]}>
        <coneGeometry args={[size * 0.15, size * 0.8, 8]} />
        <meshBasicMaterial
          color="#FF6B35"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={flare2Ref} position={[-size * 0.7, size * 0.6, size * 0.3]}>
        <coneGeometry args={[size * 0.12, size * 0.6, 8]} />
        <meshBasicMaterial
          color="#FFB347"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={flare3Ref} position={[size * 0.4, -size * 0.8, -size * 0.2]}>
        <coneGeometry args={[size * 0.18, size * 1.0, 8]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Point light for illumination */}
      <pointLight
        color="#FFF4E0"
        intensity={3}
        distance={500}
        decay={2}
      />

      {/* Secondary warm light */}
      <pointLight
        color="#FFB347"
        intensity={1.5}
        distance={300}
        decay={2}
      />
    </group>
  )
}
