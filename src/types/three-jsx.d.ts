// Type declarations for React Three Fiber and Three.js compatibility
// This file resolves version mismatches between @types/three and @react-three/fiber

declare module '@react-three/fiber' {
  import { ReactNode } from 'react'
  
  export interface RootState {
    clock: { elapsedTime: number; getDelta: () => number }
    camera: any
    scene: any
    gl: any
    size: { width: number; height: number }
    viewport: { width: number; height: number; factor: number }
    mouse: { x: number; y: number }
    raycaster: any
  }
  
  export function useFrame(callback: (state: RootState, delta: number) => void): void
  export function useThree(): RootState
  
  export interface CanvasProps {
    children?: ReactNode
    camera?: any
    shadows?: boolean
    gl?: any
    style?: React.CSSProperties
    className?: string
    [key: string]: any
  }
  
  export function Canvas(props: CanvasProps): JSX.Element
  
  export type Object3DNode<T, P> = any
  export type MaterialNode<T, P> = any
}

declare module '@react-three/drei' {
  import { ReactNode } from 'react'
  
  export interface OrbitControlsProps {
    ref?: any
    enablePan?: boolean
    enableZoom?: boolean
    enableRotate?: boolean
    minDistance?: number
    maxDistance?: number
    minPolarAngle?: number
    maxPolarAngle?: number
    minAzimuthAngle?: number
    maxAzimuthAngle?: number
    autoRotate?: boolean
    autoRotateSpeed?: number
    enableDamping?: boolean
    dampingFactor?: number
    rotateSpeed?: number
    zoomSpeed?: number
    panSpeed?: number
    screenSpacePanning?: boolean
    target?: [number, number, number]
    [key: string]: any
  }
  
  export function OrbitControls(props: OrbitControlsProps): JSX.Element
  export function Html(props: any): JSX.Element
  export function Stars(props: any): JSX.Element
  export function Environment(props: any): JSX.Element
  export function useTexture(url: string | string[]): any
  export function Sparkles(props: any): JSX.Element
}

declare module 'three' {
  export class Color {
    constructor(color?: string | number)
    r: number
    g: number
    b: number
    set(color: string | number | Color): this
    setHSL(h: number, s: number, l: number): this
    getHSL(target: { h: number; s: number; l: number }): { h: number; s: number; l: number }
    clone(): Color
  }
  
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number)
    x: number
    y: number
    z: number
    set(x: number, y: number, z: number): this
    normalize(): this
    clone(): Vector3
    add(v: Vector3): this
    sub(v: Vector3): this
    multiplyScalar(s: number): this
    length(): number
    distanceTo(v: Vector3): number
  }
  
  export class Vector2 {
    constructor(x?: number, y?: number)
    x: number
    y: number
  }
  
  export class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string)
    x: number
    y: number
    z: number
  }
  
  export class Object3D {
    position: Vector3
    rotation: Euler
    scale: Vector3
    visible: boolean
    userData: any
    add(object: Object3D): this
    remove(object: Object3D): this
    traverse(callback: (object: Object3D) => void): void
  }
  
  export class Group extends Object3D {}
  
  export class Mesh extends Object3D {
    geometry: BufferGeometry
    material: Material | Material[]
  }
  
  export class Points extends Object3D {
    geometry: BufferGeometry
    material: Material
  }
  
  export class BufferGeometry {
    setAttribute(name: string, attribute: BufferAttribute): this
    getAttribute(name: string): BufferAttribute
    dispose(): void
  }
  
  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number)
  }
  
  export class TorusGeometry extends BufferGeometry {
    constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number)
  }
  
  export class BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number, normalized?: boolean)
    array: ArrayLike<number>
    itemSize: number
    needsUpdate: boolean
  }
  
  export class Float32BufferAttribute extends BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number)
  }
  
  export class Material {
    transparent: boolean
    opacity: number
    side: number
    depthWrite: boolean
    dispose(): void
    needsUpdate: boolean
  }
  
  export class ShaderMaterial extends Material {
    uniforms: { [key: string]: { value: any } }
    vertexShader: string
    fragmentShader: string
  }
  
  export class MeshBasicMaterial extends Material {
    color: Color
  }
  
  export class MeshStandardMaterial extends Material {
    color: Color
    roughness: number
    metalness: number
    emissive: Color
    emissiveIntensity: number
  }
  
  export class PointsMaterial extends Material {
    color: Color
    size: number
    sizeAttenuation: boolean
  }
  
  export class Light extends Object3D {
    color: Color
    intensity: number
  }
  
  export class AmbientLight extends Light {}
  export class DirectionalLight extends Light {}
  export class PointLight extends Light {}
  
  export const FrontSide: number
  export const BackSide: number
  export const DoubleSide: number
  export const AdditiveBlending: number
  export const NormalBlending: number
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any
      mesh: any
      sphereGeometry: any
      torusGeometry: any
      boxGeometry: any
      planeGeometry: any
      bufferGeometry: any
      shaderMaterial: any
      meshBasicMaterial: any
      meshStandardMaterial: any
      meshPhongMaterial: any
      pointsMaterial: any
      ambientLight: any
      directionalLight: any
      pointLight: any
      spotLight: any
      hemisphereLight: any
      points: any
      line: any
      lineSegments: any
      primitive: any
    }
  }
}

export {}
