import { Float, Html, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { campusModules, type CampusModule, type CampusModuleId } from '../navigation'

const brick = '#66716b'
const brickDark = '#4e5d57'
const roof = '#354b43'
const stone = '#d8d9c8'
const wood = '#784b32'

function Window({ position, scale = [0.36, 0.55, 0.06] }: { position: [number, number, number], scale?: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh scale={scale} castShadow>
        <boxGeometry />
        <meshStandardMaterial color="#b7c9bd" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.065]} scale={[0.035, scale[1], 0.025]}>
        <boxGeometry />
        <meshStandardMaterial color={wood} />
      </mesh>
      <mesh position={[0, 0, 0.065]} scale={[scale[0], 0.035, 0.025]}>
        <boxGeometry />
        <meshStandardMaterial color={wood} />
      </mesh>
    </group>
  )
}

function GableRoof({ position, width, depth, height }: { position: [number, number, number], width: number, depth: number, height: number }) {
  const geometry = useMemo(() => {
    const w = width / 2
    const d = depth / 2
    const vertices = new Float32Array([
      -w, 0, -d,  w, 0, -d,  w, 0, d,  -w, 0, d,
      -w, height, 0,  w, height, 0,
    ])
    const indices = [
      0, 1, 5, 0, 5, 4,
      3, 4, 5, 3, 5, 2,
      0, 4, 3,
      1, 2, 5,
      0, 3, 2, 0, 2, 1,
    ]
    const shape = new THREE.BufferGeometry()
    shape.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    shape.setIndex(indices)
    shape.computeVertexNormals()
    return shape
  }, [width, depth, height])

  return (
    <group position={position}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={roof} roughness={0.9} />
      </mesh>
      <mesh position={[0, height + 0.02, 0]} scale={[width / 2 + 0.15, 0.045, 0.06]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color="#273a34" />
      </mesh>
    </group>
  )
}

function Ivy({ position, scale, rotation = [0, 0, 0] }: { position: [number, number, number], scale: [number, number, number], rotation?: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <sphereGeometry args={[1, 7, 5]} />
      <meshStandardMaterial color="#657a4f" roughness={1} />
    </mesh>
  )
}

function NorthBuilding() {
  const wingWindows = [-6.5, -5.45, -4.4, -3.35, 3.35, 4.4, 5.45, 6.5]

  return (
    <group position={[0, 0.22, -2.15]}>
      <RoundedBox args={[15, 2.15, 3.1]} radius={0.08} smoothness={2} position={[0, 1.35, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={brick} roughness={0.95} />
      </RoundedBox>
      <mesh position={[0, 0.38, 1.58]} scale={[7.75, 0.32, 0.34]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2, 0]} scale={[8.05, 0.12, 1.72]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color="#2d433b" roughness={1} />
      </mesh>
      <GableRoof position={[0, 2.42, 0]} width={15.8} depth={3.75} height={1.32} />

      {wingWindows.map((x) => (
        <group key={x}>
          <Window position={[x, 1.45, 1.565]} />
          <Window position={[x, 0.72, 1.565]} scale={[0.34, 0.42, 0.06]} />
        </group>
      ))}

      <group position={[0, 0, 0.25]}>
        <RoundedBox args={[3.1, 5.25, 3.55]} radius={0.08} smoothness={2} position={[0, 3.06, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={brickDark} roughness={0.98} />
        </RoundedBox>
        <mesh position={[0, 1.28, 1.82]} scale={[0.78, 1.15, 0.12]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color={wood} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.72, 1.96]} scale={[1.3, 0.15, 0.28]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color={stone} />
        </mesh>
        <Window position={[-0.72, 3.05, 1.795]} scale={[0.28, 0.62, 0.06]} />
        <Window position={[0, 3.05, 1.795]} scale={[0.28, 0.62, 0.06]} />
        <Window position={[0.72, 3.05, 1.795]} scale={[0.28, 0.62, 0.06]} />
        <Window position={[-0.72, 4.45, 1.795]} scale={[0.25, 0.5, 0.06]} />
        <Window position={[0, 4.45, 1.795]} scale={[0.25, 0.5, 0.06]} />
        <Window position={[0.72, 4.45, 1.795]} scale={[0.25, 0.5, 0.06]} />
        <mesh position={[0, 6.14, 0]} rotation={[0, Math.PI / 4, 0]} scale={[2.35, 1.2, 2.35]} castShadow>
          <coneGeometry args={[1, 0.75, 4]} />
          <meshStandardMaterial color={roof} roughness={0.9} />
        </mesh>
        <mesh position={[0, 6.88, 0]} scale={[0.08, 0.6, 0.08]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="#26362f" />
        </mesh>
        <mesh position={[0, 7.06, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.48, 0.06, 0.06]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="#26362f" />
        </mesh>
      </group>

      <mesh position={[0, 0.2, 3.15]} scale={[1.8, 0.18, 1.5]} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color={stone} />
      </mesh>
      {[0, 1, 2, 3].map((step) => (
        <mesh key={step} position={[0, 0.05 + step * 0.12, 2.6 - step * 0.27]} scale={[1.55 - step * 0.08, 0.12, 0.38]} receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color="#c9cabb" roughness={0.95} />
        </mesh>
      ))}

      <Ivy position={[-1.45, 2.95, 1.75]} scale={[0.34, 1.75, 0.16]} rotation={[0, 0, -0.14]} />
      <Ivy position={[1.4, 2.4, 1.78]} scale={[0.28, 1.25, 0.15]} rotation={[0, 0, 0.2]} />
      <Ivy position={[-5.1, 1.45, 1.61]} scale={[0.22, 0.8, 0.12]} />
    </group>
  )
}

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
      <mesh position={[0, 0.35, 0]} scale={[0.75, 0.08, 0.3]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color={wood} />
      </mesh>
      <mesh position={[0, 0.7, -0.27]} scale={[0.75, 0.3, 0.07]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color={wood} />
      </mesh>
      {[-0.55, 0.55].map((x) => <mesh key={x} position={[x, 0.16, 0]} scale={[0.06, 0.2, 0.24]}><boxGeometry /><meshStandardMaterial color="#38483f" /></mesh>)}
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
  about: [0, 7.25, -1.9],
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

          <mesh position={[0, 0.28, 3.7]} scale={[2.1, 0.1, 5.0]} receiveShadow>
            <boxGeometry />
            <meshStandardMaterial color="#d6d3c2" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.31, 5.35]} scale={[5.6, 0.11, 1.25]} receiveShadow>
            <boxGeometry />
            <meshStandardMaterial color="#c4c8b5" roughness={1} />
          </mesh>
          {[-1.38, -0.46, 0.46, 1.38].map((x) => (
            <mesh key={x} position={[x, 0.42, 4.5]} scale={[0.04, 0.015, 4.1]}>
              <boxGeometry />
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

          <Bench position={[-4.1, 0.35, 2.6]} rotation={0.2} />
          <Bench position={[4.3, 0.35, 2.6]} rotation={-0.2} />
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
