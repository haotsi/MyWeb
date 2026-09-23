import { Float, Html, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { campusModules, type CampusModule, type CampusModuleId } from '../navigation'
import { NorthBuilding } from './NorthBuilding'
import { Tree, Bench } from './GardenFurniture'
import { NanyongBuilding } from './NanyongBuilding'

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.07, 1.5, 7]} />
        <meshStandardMaterial color="#34463f" />
      </mesh>
      <mesh position={[0, 1.52, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#f2ddb0" emissive="#e3c68d" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

const highlightPositions: Record<CampusModuleId, [number, number, number]> = {
  about: [0, 0.55, -2.1],
  projects: [5.0, 0.5, -2.0],
  logic: [-4.6, 0.5, -2.0],
  ai: [4.0, 0.5, 3.9],
  notes: [-5.0, 0.5, 1.1],
  links: [0, 0.5, 5.7],
}

function FocusGlow({ module }: { module: CampusModuleId }) {
  const ring = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.09
    ring.current?.scale.setScalar(pulse)
    if (material.current) material.current.opacity = 0.3 + Math.sin(clock.elapsedTime * 2.6) * 0.08
  })
  return (
    <group position={highlightPositions[module]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.38, 48]} />
        <meshBasicMaterial ref={material} color="#e6f3c5" transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 2.2, 0]} intensity={3.2} distance={6} color="#d9edb7" />
    </group>
  )
}

const navigationAnchors: Record<CampusModuleId, [number, number, number]> = {
  about: [0, 8.05, -0.88],
  projects: [5.1, 3.45, -0.8],
  logic: [-4.8, 3.45, -0.8],
  ai: [4.2, 1.2, 3.7],
  notes: [-4.6, 1.25, 2.2],
  links: [0, 1.0, 5.9],
}

function SceneNavigation({ activeModule, onHover, onSelect }: {
  activeModule: CampusModuleId | null
  onHover: (id: CampusModuleId | null) => void
  onSelect: (item: CampusModule) => void
}) {
  return (
    <group>
      {campusModules.map((item) => (
        <Html key={item.id} position={navigationAnchors[item.id]} center zIndexRange={[20, 10]}>
          <div className={`scene-nav-anchor scene-nav-anchor--${item.id}`}>
            <button
              type="button"
              className={`scene-nav-card${activeModule === item.id ? ' is-active' : ''}`}
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(item.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(item)}
              aria-label={`${item.title}：${item.subtitle}`}
            >
              <span className="scene-nav-index">{item.index}</span>
              <span className="scene-nav-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
              <span className="scene-nav-arrow" aria-hidden="true">↗</span>
            </button>
            <span className="scene-nav-line" aria-hidden="true"><i /></span>
          </div>
        </Html>
      ))}
    </group>
  )
}

function SceneLayer({ active, direction, children }: { active: boolean, direction: number, children: ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const opacity = useRef(active ? 1 : 0)
  const materials = useRef<{ material: THREE.Material, opacity: number, transparent: boolean, depthWrite: boolean }[]>([])
  const shadows = useRef<{ mesh: THREE.Mesh, castShadow: boolean }[]>([])

  useLayoutEffect(() => {
    const root = group.current
    if (!root) return
    const originals: { mesh: THREE.Mesh, material: THREE.Material | THREE.Material[] }[] = []
    const cloned = new Map<THREE.Material, THREE.Material>()
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      originals.push({ mesh: object, material: object.material })
      shadows.current.push({ mesh: object, castShadow: object.castShadow })
      const copy = (material: THREE.Material) => {
        let instance = cloned.get(material)
        if (!instance) {
          instance = material.clone()
          cloned.set(material, instance)
          materials.current.push({ material: instance, opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite })
        }
        return instance
      }
      object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material)
    })
    root.visible = active
    return () => {
      originals.forEach(({ mesh, material }) => { mesh.material = material })
      cloned.forEach((material) => material.dispose())
      materials.current = []
      shadows.current = []
    }
  }, [])

  useFrame((_, delta) => {
    const root = group.current
    if (!root) return
    const target = active ? 1 : 0
    const next = THREE.MathUtils.damp(opacity.current, target, 5.5, delta)
    opacity.current = Math.abs(next - target) < 0.002 ? target : next
    const value = opacity.current
    root.visible = value > 0.002
    root.position.y = (1 - value) * -0.32
    root.rotation.y = (1 - value) * direction * 0.06
    root.scale.setScalar(0.95 + value * 0.05)
    for (const { material, opacity: originalOpacity, transparent, depthWrite } of materials.current) {
      const needsTransparency = value < 0.999 || transparent
      if (material.transparent !== needsTransparency) {
        material.transparent = needsTransparency
        material.needsUpdate = true
      }
      material.opacity = originalOpacity * value
      material.depthWrite = value >= 0.999 ? depthWrite : false
    }
    for (const { mesh, castShadow } of shadows.current) mesh.castShadow = value >= 0.98 && castShadow
  })

  return <group ref={group}>{children}</group>
}

export function CampusScene({ lowQuality, activeModule, onModuleHover, onModuleSelect, showNavigation, sceneVariant }: {
  lowQuality: boolean
  sceneVariant: 'north' | 'nanyong'
  activeModule: CampusModuleId | null
  onModuleHover: (id: CampusModuleId | null) => void
  onModuleSelect: (item: CampusModule) => void
  showNavigation: boolean
}) {
  const pebbles = useMemo(() => Array.from({ length: lowQuality ? 8 : 20 }, (_, i) => ({
    x: Math.sin(i * 13.7) * 7.2,
    z: 2.5 + Math.cos(i * 8.3) * 4.6,
    s: 0.1 + (i % 4) * 0.035,
  })), [lowQuality])

  return (
    <group position={[0, -1.25, 0]}>
      <Float speed={0.45} rotationIntensity={0.012} floatIntensity={0.09}>
        <SceneLayer active={sceneVariant === 'nanyong'} direction={1}><NanyongBuilding /></SceneLayer>
        <SceneLayer active={sceneVariant === 'north'} direction={-1}><group>
          <RoundedBox args={[21, 0.75, 17]} radius={0.34} smoothness={3} position={[0, -0.42, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#c9cbb7" roughness={0.95} />
          </RoundedBox>
          <RoundedBox args={[20.1, 0.38, 16.1]} radius={0.25} smoothness={2} position={[0, 0.05, 0]} receiveShadow>
            <meshStandardMaterial color="#8eaa78" roughness={1} />
          </RoundedBox>

          <mesh position={[0, 0.265, 3.7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3.5, 9.4]} />
            <meshStandardMaterial color="#d6d3c2" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.27, 5.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10.8, 1.7]} />
            <meshStandardMaterial color="#c4c8b5" roughness={1} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => 0.2 + i * 1.05).map((z) => (
            <mesh key={z} position={[0, 0.276, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.28, 0.035]} />
              <meshStandardMaterial color="#aaa999" />
            </mesh>
          ))}

          <NorthBuilding />

          <Tree position={[-8, 0.25, -4.7]} scale={1.18} />
          <Tree position={[-7.4, 0.25, 3.3]} scale={1.1} autumn />
          <Tree position={[7.8, 0.25, -4.3]} scale={1.14} />
          <Tree position={[7.5, 0.25, 3.8]} scale={1.04} autumn />
          <Tree position={[-5.2, 0.25, 6.2]} scale={0.85} />
          <Tree position={[5.6, 0.25, 6.4]} scale={0.9} />

          <Bench position={[-3.45, 0.28, 3.35]} rotation={0.08} />
          <Bench position={[3.45, 0.28, 3.35]} rotation={-0.08} />
          <Lamp position={[-2.25, 0.32, 2.1]} />
          <Lamp position={[2.25, 0.32, 2.1]} />
          <Lamp position={[-2.25, 0.32, 6.4]} />
          <Lamp position={[2.25, 0.32, 6.4]} />

          {pebbles.map((p, i) => (
            <mesh key={i} position={[p.x, 0.43, p.z]} scale={[p.s * 1.5, p.s, p.s]} rotation={[0, i * 0.8, 0]} castShadow>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={i % 2 ? '#c9c7b5' : '#9da796'} roughness={1} />
            </mesh>
          ))}

          <mesh position={[0, -0.83, 0]} receiveShadow>
            <planeGeometry args={[45, 42]} />
            <shadowMaterial transparent opacity={0.18} color="#53685d" />
          </mesh>
        </group></SceneLayer>
        {sceneVariant === 'north' && activeModule && <FocusGlow key={activeModule} module={activeModule} />}
        {sceneVariant === 'north' && showNavigation && <SceneNavigation activeModule={activeModule} onHover={onModuleHover} onSelect={onModuleSelect} />}
      </Float>
    </group>
  )
}
