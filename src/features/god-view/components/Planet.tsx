import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { World } from '@/types'
import Moon, { MoonOrbit, type MoonData } from './Moon'

// NASA/ESA-quality ultra-realistic planet surface shader
// Designed to match 4K space photography while remaining real-time optimized
const planetVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vElevation;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    vElevation = length(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const planetFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uAtmosphereColor;
  uniform float uSurfaceType;
  uniform vec3 uLightDirection;
  uniform float uHovered;
  uniform float uRoughness;
  uniform float uMetalness;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vElevation;
  
  // High-quality noise functions for NASA-level detail
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
  
  // Multi-octave FBM for realistic terrain - scientifically accurate erosion patterns
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float lacunarity = 2.1; // Slightly irregular for natural look
    float persistence = 0.48;
    for(int i = 0; i < 8; i++) {
      if(i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    return value;
  }
  
  // Ridged noise for mountain ridges and erosion patterns
  float ridgedNoise(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float weight = 1.0;
    for(int i = 0; i < 6; i++) {
      if(i >= octaves) break;
      float n = 1.0 - abs(snoise(p * frequency));
      n = n * n * weight;
      weight = clamp(n * 2.0, 0.0, 1.0);
      value += n * amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  // Voronoi for impact craters - scientifically accurate crater distribution
  vec3 voronoi(vec3 p) {
    vec3 n = floor(p);
    vec3 f = fract(p);
    float minDist = 1.0;
    float secondMin = 1.0;
    vec3 cellId = vec3(0.0);
    for(int i = -1; i <= 1; i++) {
      for(int j = -1; j <= 1; j++) {
        for(int k = -1; k <= 1; k++) {
          vec3 neighbor = vec3(float(i), float(j), float(k));
          vec3 cellPos = n + neighbor;
          vec3 point = neighbor + 0.5 + 0.45 * sin(6.2831 * fract(sin(dot(cellPos, vec3(127.1, 311.7, 74.7))) * 43758.5453));
          float d = length(point - f);
          if(d < minDist) {
            secondMin = minDist;
            minDist = d;
            cellId = cellPos;
          } else if(d < secondMin) {
            secondMin = d;
          }
        }
      }
    }
    return vec3(minDist, secondMin, fract(sin(dot(cellId, vec3(127.1, 311.7, 74.7))) * 43758.5453));
  }
  
  // Calculate crater depth with realistic rim and ejecta
  float craterProfile(float dist, float size) {
    float rim = smoothstep(size * 0.8, size, dist) * 0.15;
    float bowl = smoothstep(0.0, size * 0.6, dist);
    float floor = smoothstep(size * 0.2, size * 0.4, dist) * 0.3;
    return mix(-0.3, rim, bowl) + floor;
  }
  
  // Limb darkening - physically accurate atmospheric scattering
  float limbDarkening(vec3 normal, vec3 viewDir) {
    float NdotV = max(dot(normal, viewDir), 0.0);
    // Quadratic limb darkening coefficient (realistic for rocky planets)
    return 0.6 + 0.4 * NdotV;
  }
  
  void main() {
    vec3 pos = vPosition * 2.0;
    vec3 sphereNormal = normalize(vPosition);
    
    // === ALBEDO / COLOR GENERATION ===
    // Multi-scale continental structure
    float continentBase = fbm(pos * 0.5, 5) * 0.5 + 0.5;
    float continentDetail = fbm(pos * 1.2 + 100.0, 4) * 0.3;
    float continents = continentBase + continentDetail;
    
    // Mountain ranges with realistic erosion
    float mountains = ridgedNoise(pos * 2.5, 5) * 0.5;
    float erosion = fbm(pos * 6.0, 3) * 0.15;
    
    // Fine surface detail (lava plains, regolith variation)
    float fineDetail = fbm(pos * 12.0, 4) * 0.08;
    float microDetail = snoise(pos * 25.0) * 0.03;
    
    // === CRATER SYSTEM ===
    // Large impact basins
    vec3 largeCraters = voronoi(pos * 1.2);
    float largeCreaterDepth = craterProfile(largeCraters.x, 0.4) * 0.4 * step(0.85, largeCraters.z);
    
    // Medium craters
    vec3 medCraters = voronoi(pos * 3.0);
    float medCraterDepth = craterProfile(medCraters.x, 0.25) * 0.2 * step(0.7, medCraters.z);
    
    // Small impact craters
    vec3 smallCraters = voronoi(pos * 8.0);
    float smallCraterDepth = craterProfile(smallCraters.x, 0.15) * 0.1 * step(0.6, smallCraters.z);
    
    float totalCraterDepth = largeCreaterDepth + medCraterDepth + smallCraterDepth;
    
    // === SURFACE TYPE VARIATIONS ===
    float latitude = abs(sphereNormal.y);
    float oceanMask = smoothstep(0.42, 0.48, continents);
    float polarMask = smoothstep(0.75, 0.95, latitude);
    float equatorMask = 1.0 - smoothstep(0.0, 0.3, latitude);
    
    // === COLOR COMPOSITION ===
    // Desaturate base colors slightly for realism
    vec3 baseColor1 = mix(uColor1, vec3(dot(uColor1, vec3(0.299, 0.587, 0.114))), 0.15);
    vec3 baseColor2 = mix(uColor2, vec3(dot(uColor2, vec3(0.299, 0.587, 0.114))), 0.1);
    vec3 baseColor3 = mix(uColor3, vec3(dot(uColor3, vec3(0.299, 0.587, 0.114))), 0.2);
    
    // Ocean colors - deep blue with subtle variation
    vec3 deepOcean = baseColor1 * 0.3;
    vec3 shallowOcean = baseColor1 * 0.6;
    vec3 oceanColor = mix(deepOcean, shallowOcean, fbm(pos * 4.0, 2) * 0.5 + 0.5);
    
    // Land colors - varied terrain
    vec3 lowlandColor = baseColor2 * 0.7;
    vec3 highlandColor = baseColor3 * 0.9;
    vec3 mountainColor = mix(baseColor2, vec3(0.4, 0.35, 0.3), 0.3);
    
    vec3 landColor = mix(lowlandColor, highlandColor, smoothstep(0.3, 0.7, continents));
    landColor = mix(landColor, mountainColor, mountains);
    landColor += erosion * baseColor3 * 0.5;
    
    // Polar ice caps - realistic gradual transition
    vec3 iceColor = vec3(0.92, 0.95, 0.98);
    vec3 frostColor = vec3(0.85, 0.88, 0.92);
    vec3 polarColor = mix(frostColor, iceColor, smoothstep(0.85, 0.98, latitude));
    
    // Composite surface color
    vec3 surfaceColor = mix(oceanColor, landColor, oceanMask);
    surfaceColor = mix(surfaceColor, polarColor, polarMask * 0.85);
    
    // Add fine detail and crater shading
    surfaceColor += fineDetail + microDetail;
    surfaceColor -= totalCraterDepth * 0.15;
    
    // Subtle color temperature variation (warmer equator, cooler poles)
    surfaceColor = mix(surfaceColor * vec3(1.02, 1.0, 0.98), surfaceColor * vec3(0.98, 0.99, 1.02), latitude);
    
    // === ROUGHNESS MAP (procedural) ===
    float roughness = 0.7;
    roughness -= oceanMask * 0.4; // Oceans are smoother
    roughness += mountains * 0.2; // Mountains are rougher
    roughness += abs(totalCraterDepth) * 0.3; // Craters add roughness
    roughness = clamp(roughness, 0.1, 0.95);
    
    // === LIGHTING (Physically-based approximation) ===
    vec3 lightDir = normalize(uLightDirection);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    
    float NdotL = max(dot(vNormal, lightDir), 0.0);
    float NdotV = max(dot(vNormal, viewDir), 0.0);
    float NdotH = max(dot(vNormal, halfDir), 0.0);
    
    // Strong terminator line - key for realism
    float terminator = smoothstep(-0.05, 0.25, NdotL);
    
    // Subtle shadow softening at terminator (atmospheric scattering)
    float shadowSoft = smoothstep(-0.15, 0.0, NdotL) * 0.15;
    
    // Limb darkening for photographic realism
    float limb = limbDarkening(vNormal, viewDir);
    
    // === FRESNEL-BASED ATMOSPHERIC SCATTERING ===
    float fresnel = pow(1.0 - NdotV, 4.0);
    
    // Thin atmospheric glow at horizon (not volumetric)
    vec3 atmosphereColor = uAtmosphereColor * 0.6 + vec3(0.4, 0.6, 0.8) * 0.4;
    float atmosphereIntensity = fresnel * 0.6 * (0.5 + NdotL * 0.5);
    vec3 atmosphereGlow = atmosphereColor * atmosphereIntensity;
    
    // Rim lighting from atmosphere
    float rimLight = pow(fresnel, 2.0) * 0.3;
    
    // === SPECULAR (subtle, physically accurate) ===
    float specPower = mix(128.0, 16.0, roughness);
    float spec = pow(NdotH, specPower) * (1.0 - roughness) * 0.15;
    spec *= (1.0 - oceanMask) * 0.3 + oceanMask * 0.8; // Oceans more reflective
    
    // === AMBIENT OCCLUSION ===
    float ao = 0.75 + 0.25 * (continents * 0.5 + 0.5);
    ao -= totalCraterDepth * 0.5;
    ao = clamp(ao, 0.4, 1.0);
    
    // === FINAL COMPOSITION ===
    // Ambient (very subtle, space is dark)
    vec3 ambient = surfaceColor * 0.08 * ao;
    
    // Diffuse with terminator
    vec3 diffuse = surfaceColor * NdotL * terminator * limb * 0.9;
    
    // Shadow fill from atmosphere
    vec3 shadowFill = surfaceColor * shadowSoft * atmosphereColor * 0.3;
    
    // Specular
    vec3 specular = vec3(1.0, 0.98, 0.95) * spec * NdotL;
    
    vec3 finalColor = ambient + diffuse + shadowFill + specular + atmosphereGlow;
    
    // Add subtle rim light
    finalColor += atmosphereColor * rimLight * (0.3 + NdotL * 0.7);
    
    // === GAS GIANT BANDING (if applicable) ===
    if(uSurfaceType > 0.5) {
      float bandFreq = 12.0 + fbm(pos * 0.5, 2) * 4.0;
      float bands = sin(sphereNormal.y * bandFreq + fbm(pos * 2.0, 3) * 1.5);
      float bandIntensity = smoothstep(-0.2, 0.2, bands) * 0.15;
      
      // Storm spots
      vec3 stormPos = voronoi(pos * 0.8);
      float storm = smoothstep(0.3, 0.1, stormPos.x) * step(0.9, stormPos.z) * 0.2;
      
      finalColor = mix(finalColor, finalColor * (1.0 + bandIntensity), 0.7);
      finalColor += uColor2 * storm;
    }
    
    // Hover effect (subtle glow)
    finalColor += atmosphereColor * uHovered * 0.12;
    
    // Exposure/tone mapping for HDR-like appearance
    finalColor = finalColor / (finalColor + vec3(0.5));
    
    // Subtle contrast enhancement
    finalColor = pow(finalColor, vec3(0.95));
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// Cloud layer shader
const cloudVertexShader = `
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

const cloudFragmentShader = `
  uniform float uTime;
  uniform vec3 uCloudColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
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
    for(int i = 0; i < 4; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec3 pos = vPosition * 3.0;
    
    // Animated cloud patterns
    float clouds1 = fbm(pos + vec3(uTime * 0.02, 0.0, uTime * 0.01));
    float clouds2 = fbm(pos * 1.5 + vec3(-uTime * 0.015, uTime * 0.01, 0.0));
    
    float cloudDensity = smoothstep(0.0, 0.5, clouds1 * 0.5 + clouds2 * 0.5 + 0.3);
    cloudDensity *= smoothstep(0.8, 0.2, abs(vPosition.y / length(vPosition))); // Less at poles
    
    // Soft edges
    float alpha = cloudDensity * 0.4;
    
    gl_FragColor = vec4(uCloudColor, alpha);
  }
`

interface PlanetProps {
  world: World
  position: [number, number, number]
  distance: number
  onClick: () => void
  onHover: (hovered: boolean) => void
  isHovered: boolean
}

export default function Planet({ world, position, distance, onClick, onHover, isHovered }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const planetRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const [hoverScale, setHoverScale] = useState(1)
  const [idleOffset, setIdleOffset] = useState({ x: 0, y: 0, z: 0 })

  // Generate colors from theme with enhanced contrast
  const colors = useMemo(() => {
    const base = new THREE.Color(world.colorTheme)
    const hsl = { h: 0, s: 0, l: 0 }
    base.getHSL(hsl)
    
    return {
      primary: base,
      secondary: new THREE.Color().setHSL((hsl.h + 0.15) % 1, Math.min(hsl.s * 1.2, 1), hsl.l * 0.7),
      tertiary: new THREE.Color().setHSL((hsl.h + 0.3) % 1, Math.min(hsl.s * 0.8, 1), hsl.l * 0.5),
      rim: new THREE.Color().setHSL(hsl.h, Math.min(hsl.s * 1.5, 1), Math.min(hsl.l * 1.8, 1)),
      atmosphere: new THREE.Color().setHSL(hsl.h, hsl.s * 0.6, Math.min(hsl.l * 1.4, 0.9)),
    }
  }, [world.colorTheme])

  // Determine surface type based on world properties
  const surfaceType = useMemo(() => {
    const textures = ['rocky', 'oceanic', 'gaseous', 'crystalline', 'volcanic', 'lush', 'frozen', 'metallic']
    const idx = textures.indexOf(world.surfaceTexture)
    return idx >= 0 ? idx / textures.length : 0
  }, [world.surfaceTexture])

  // Planet shader uniforms
  const planetUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: colors.primary },
    uColor2: { value: colors.secondary },
    uColor3: { value: colors.tertiary },
    uAtmosphereColor: { value: colors.atmosphere },
    uSurfaceType: { value: surfaceType },
    uLightDirection: { value: new THREE.Vector3(1, 0.5, 0.8).normalize() },
    uHovered: { value: 0 },
  }), [colors, surfaceType])

  // Cloud shader uniforms
  const cloudUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uCloudColor: { value: new THREE.Color('#ffffff') },
  }), [])

  // Planet size - balanced for good spacing
  const planetSize = useMemo(() => {
    const baseSize = 3.5 + world.sizeFactor * 0.8 // Moderate size
    return baseSize
  }, [world.sizeFactor])

  // Motion speed based on distance (parallax effect)
  const motionSpeed = useMemo(() => {
    return Math.max(0.3, 1 - distance / 80) // Slower when farther
  }, [distance])

  // Slow, intentional motion using sine waves and noise
  useFrame((state: any) => {
    const time = state.clock.elapsedTime * 0.3 // Very slow time scale
    
    // Update shader uniforms
    if (planetRef.current) {
      const material = planetRef.current.material as THREE.ShaderMaterial
      if (material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime
        material.uniforms.uHovered.value += (isHovered ? 1 : 0 - material.uniforms.uHovered.value) * 0.05
      }
      // Planetary rotation - slow and steady
      planetRef.current.rotation.y += 0.001 * motionSpeed
      planetRef.current.rotation.x = Math.sin(time * 0.1) * 0.02
    }
    
    // Update cloud shader
    if (cloudsRef.current) {
      const material = cloudsRef.current.material as THREE.ShaderMaterial
      if (material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime
      }
      // Clouds rotate slightly faster than planet
      cloudsRef.current.rotation.y += 0.0015 * motionSpeed
    }
    
    // Smooth hover scale with soft easing
    const targetScale = isHovered ? 1.08 : 1
    setHoverScale(prev => prev + (targetScale - prev) * 0.06)
    
    // Idle motion - never stops, very subtle
    const idleX = Math.sin(time * 0.4 + distance * 0.1) * 0.15 * motionSpeed
    const idleY = Math.sin(time * 0.3 + distance * 0.05) * 0.1 * motionSpeed
    const idleZ = Math.cos(time * 0.2 + distance * 0.08) * 0.12 * motionSpeed
    
    setIdleOffset({ x: idleX, y: idleY, z: idleZ })
    
    // Apply idle motion to group
    if (groupRef.current) {
      groupRef.current.position.set(
        position[0] + idleOffset.x,
        position[1] + idleOffset.y + (isHovered ? Math.sin(time * 1.5) * 0.2 : 0),
        position[2] + idleOffset.z
      )
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      scale={hoverScale}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e: React.PointerEvent) => {
        e.stopPropagation()
        onHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(false)
        document.body.style.cursor = 'default'
      }}
    >
      {/* Main planet body with hyper-realistic shader */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[planetSize, 64, 64]} />
        <shaderMaterial
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={planetUniforms}
        />
      </mesh>

      {/* Animated cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[planetSize * 1.025, 40, 40]} />
        <shaderMaterial
          vertexShader={cloudVertexShader}
          fragmentShader={cloudFragmentShader}
          uniforms={cloudUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshBasicMaterial
          color={colors.atmosphere}
          transparent
          opacity={isHovered ? 0.35 : 0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmosphere haze */}
      <mesh scale={1.25}>
        <sphereGeometry args={[planetSize, 24, 24]} />
        <meshBasicMaterial
          color={colors.atmosphere}
          transparent
          opacity={isHovered ? 0.12 : 0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbital ring around planet - always visible like Saturn rings */}
      <group rotation={[Math.PI / 2.2, 0.15, 0.1]}>
        {/* Main ring */}
        <mesh>
          <torusGeometry args={[planetSize * 1.6, 0.06, 8, 100]} />
          <meshBasicMaterial
            color="#ffaa55"
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Ring glow */}
        <mesh>
          <torusGeometry args={[planetSize * 1.6, 0.12, 16, 100]} />
          <meshBasicMaterial
            color="#ff8844"
            transparent
            opacity={0.25}
          />
        </mesh>
        {/* Outer subtle ring */}
        <mesh>
          <torusGeometry args={[planetSize * 1.9, 0.04, 8, 100]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
          />
        </mesh>
      </group>

      {/* Urgent task indicators - orbiting satellites */}
      {Array.from({ length: Math.min(world.urgentTaskCount || 0, 5) }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2
        const orbitR = planetSize * 2.2
        return (
          <group key={i}>
            <mesh
              position={[
                Math.cos(angle) * orbitR,
                Math.sin(angle * 2) * 0.3,
                Math.sin(angle) * orbitR,
              ]}
            >
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#ff4444" />
            </mesh>
            <mesh
              position={[
                Math.cos(angle) * orbitR,
                Math.sin(angle * 2) * 0.3,
                Math.sin(angle) * orbitR,
              ]}
            >
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial 
                color="#ff4444" 
                transparent 
                opacity={0.3}
              />
            </mesh>
          </group>
        )
      })}

      {/* Moons - sub-sections of the world */}
      {world.sections && world.sections.length > 0 && (
        <>
          {world.sections.slice(0, 4).map((section, i) => {
            const moonData: MoonData = {
              id: section.id,
              name: section.name,
              orbitRadius: planetSize * 2.5 + i * 1.2,
              size: 0.3 + (i % 2) * 0.15,
              orbitSpeed: 0.3 + i * 0.1,
            }
            return (
              <Moon
                key={section.id}
                moon={moonData}
                parentPosition={[0, 0, 0]}
                index={i}
                totalMoons={Math.min(world.sections!.length, 4)}
                isParentHovered={isHovered}
              />
            )
          })}
          {/* Orbit paths visible on hover */}
          {isHovered && world.sections.slice(0, 4).map((_, i) => (
            <MoonOrbit
              key={`orbit-${i}`}
              parentPosition={[0, 0, 0]}
              radius={planetSize * 2.5 + i * 1.2}
              tilt={i * 0.1}
              opacity={0.1}
            />
          ))}
        </>
      )}

      {/* World label - positioned like reference image */}
      <Html
        position={[0, -(planetSize + 3.5), 0]}
        center
        distanceFactor={12}
        style={{
          transition: 'all 0.3s ease',
          opacity: 1,
        }}
      >
        <div className="pointer-events-none select-none text-center">
          <p 
            className="text-white text-lg font-semibold whitespace-nowrap"
            style={{
              textShadow: '0 3px 15px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,1)',
              letterSpacing: '0.08em',
              fontWeight: '600',
            }}
          >
            {world.name}
          </p>
          {isHovered && (
            <p 
              className="text-white/80 text-sm mt-1.5 font-medium"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)',
              }}
            >
              {world.taskCount || 0} tasks
            </p>
          )}
        </div>
      </Html>
    </group>
  )
}
