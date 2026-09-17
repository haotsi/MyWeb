import { Float, Html, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { campusModules, type CampusModule, type CampusModuleId } from '../navigation'
import { NorthBuilding } from './NorthBuilding'

const wood = '#784b32'

function Tree({ position, scale = 1, autumn = false }: { position: [number, number, number], scale?: number, autumn?: boolean }) {
  const crown = autumn ? '#aeb46a' : '#718b62'
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 2.7, 7]} />
        <meshStandardMaterial color="#755941" roughness={1} />
      </mesh>
      <mesh position={[0, 3.05, 0]} castShadow>
        <icosahedronGeometry args={[1.22, 1]} />
        <meshStandardMaterial color={crown} roughness={1} flatShading />
      </mesh>
      <mesh position={[-0.72, 2.78, 0.12]} castShadow>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color={autumn ? '#c3bd72' : '#80976e'} roughness={1} flatShading />
      </mesh>
      <mesh position={[0.68, 2.78, -0.1]} castShadow>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color={autumn ? '#9ca45f' : '#627e58'} roughness={1} flatShading />
      </mesh>
    </group>
  )
}

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

function Bench({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.22, 0, 0.22].map((z) => <mesh key={`seat-${z}`} position={[0, 0.46, z]} scale={[0.78, 0.045, 0.075]} castShadow><boxGeometry /><meshStandardMaterial color={wood} roughness={0.92} /></mesh>)}
      {[-0.12, 0.1, 0.32].map((y) => <mesh key={`back-${y}`} position={[0, 0.78 + y, -0.29]} scale={[0.78, 0.045, 0.055]} castShadow><boxGeometry /><meshStandardMaterial color={wood} roughness={0.92} /></mesh>)}
      {[-0.58, 0.58].map((x) => <group key={x} position={[x, 0, 0]}><mesh position={[0, 0.23, 0]} scale={[0.055, 0.23, 0.22]} castShadow><boxGeometry /><meshStandardMaterial color="#38483f" roughness={0.95} /></mesh><mesh position={[0, 0.72, -0.29]} rotation={[0, 0, -0.08]} scale={[0.05, 0.38, 0.05]} castShadow><boxGeometry /><meshStandardMaterial color="#38483f" roughness={0.95} /></mesh></group>)}
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
  about: [0, 8.45, -1.9],
  projects: [5.1, 3.2, -1.75],
  logic: [-4.8, 3.15, -1.75],
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

export function CampusScene({ lowQuality, activeModule, onModuleHover, onModuleSelect, showNavigation }: {
  lowQuality: boolean
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
        <group>
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
          {activeModule && <FocusGlow key={activeModule} module={activeModule} />}
          {showNavigation && <SceneNavigation activeModule={activeModule} onHover={onModuleHover} onSelect={onModuleSelect} />}

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
        </group>
      </Float>
    </group>
  )
}
