import { useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'

const brick = '#5c6863'
const brickLight = '#6e7973'
const brickDark = '#47534f'
const roof = '#344942'
const roofEdge = '#263933'
const stone = '#d7d8ca'
const wood = '#6e4632'

type ModelProps = { modelUrl?: string }
type Point = [number, number, number]

function Window({ position, scale = [0.28, 0.43, 0.055] }: { position: Point, scale?: Point }) {
  return (
    <group position={position}>
      <mesh scale={scale} castShadow>
        <boxGeometry />
        <meshStandardMaterial color="#b7c7bc" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.065]} scale={[0.025, scale[1], 0.02]}><boxGeometry /><meshStandardMaterial color={wood} /></mesh>
      <mesh position={[0, 0, 0.065]} scale={[scale[0], 0.025, 0.02]}><boxGeometry /><meshStandardMaterial color={wood} /></mesh>
      <mesh position={[0, -scale[1] - 0.06, 0.025]} scale={[scale[0] + 0.08, 0.055, 0.1]} castShadow><boxGeometry /><meshStandardMaterial color={stone} roughness={0.9} /></mesh>
    </group>
  )
}

function HipRoof({ position, width, depth, height }: { position: Point, width: number, depth: number, height: number }) {
  const geometry = useMemo(() => {
    const w = width / 2
    const d = depth / 2
    const ridge = Math.max(0.35, w - d)
    const vertices = new Float32Array([-w, 0, -d, w, 0, -d, w, 0, d, -w, 0, d, -ridge, height, 0, ridge, height, 0])
    const shape = new THREE.BufferGeometry()
    shape.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    shape.setIndex([3, 2, 5, 3, 5, 4, 0, 4, 5, 0, 5, 1, 0, 3, 4, 1, 5, 2, 0, 1, 2, 0, 2, 3])
    shape.computeVertexNormals()
    return shape
  }, [width, depth, height])

  return (
    <group position={position}>
      <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={roof} roughness={0.96} flatShading /></mesh>
      {[1, -1].map((zSign) => (
        <mesh key={zSign} position={[0, 0.02, zSign * (depth / 2 + 0.12)]} scale={[width / 2 + 0.24, 0.075, 0.12]} castShadow>
          <boxGeometry /><meshStandardMaterial color={roofEdge} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.025, 0]} scale={[Math.max(0.45, width / 2 - depth / 2), 0.055, 0.07]} castShadow><boxGeometry /><meshStandardMaterial color="#21342e" roughness={0.9} /></mesh>
      {[-1, 1].flatMap((xSign) => [-1, 1].map((zSign) => (
        <mesh key={`${xSign}-${zSign}`} position={[xSign * (width / 2 + 0.18), 0.16, zSign * (depth / 2 + 0.12)]} rotation={[0, 0, -xSign * 0.18]} scale={[0.32, 0.055, 0.09]} castShadow>
          <boxGeometry /><meshStandardMaterial color={roofEdge} roughness={0.92} />
        </mesh>
      )))}
    </group>
  )
}

function ArchedEntrance() {
  return (
    <group position={[0, 0, 1.76]}>
      <mesh position={[0, 0.82, 0]} scale={[0.55, 0.78, 0.1]} castShadow><boxGeometry /><meshStandardMaterial color={wood} roughness={0.82} /></mesh>
      <mesh position={[0, 1.6, 0.015]}><ringGeometry args={[0.42, 0.6, 24, 1, 0, Math.PI]} /><meshStandardMaterial color={stone} roughness={0.92} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 1.56, 0]} scale={[0.42, 0.38, 0.06]}><circleGeometry args={[1, 20, 0, Math.PI]} /><meshStandardMaterial color="#9eafa5" roughness={0.6} side={THREE.DoubleSide} /></mesh>
      {[-0.65, 0.65].map((x) => <mesh key={x} position={[x, 1.02, 0]} scale={[0.075, 1.05, 0.13]} castShadow><boxGeometry /><meshStandardMaterial color={stone} roughness={0.92} /></mesh>)}
    </group>
  )
}

function ClockFace() {
  return (
    <group position={[0, 5.7, 1.675]}>
      <mesh><circleGeometry args={[0.31, 20]} /><meshStandardMaterial color="#d9dbcf" roughness={0.85} /></mesh>
      <mesh position={[0, 0, 0.012]}><ringGeometry args={[0.25, 0.31, 20]} /><meshStandardMaterial color={brickDark} roughness={0.9} /></mesh>
      <mesh position={[0.02, 0.06, 0.022]} rotation={[0, 0, -0.52]} scale={[0.025, 0.15, 0.018]}><boxGeometry /><meshStandardMaterial color={brickDark} /></mesh>
      <mesh position={[-0.05, -0.01, 0.024]} rotation={[0, 0, 0.86]} scale={[0.025, 0.11, 0.018]}><boxGeometry /><meshStandardMaterial color={brickDark} /></mesh>
    </group>
  )
}

function StoneBalcony() {
  const balusters = [-0.86, -0.57, -0.28, 0, 0.28, 0.57, 0.86]
  return (
    <group position={[0, 4.72, 1.8]}>
      <mesh scale={[1.08, 0.08, 0.29]} castShadow><boxGeometry /><meshStandardMaterial color={stone} roughness={0.92} /></mesh>
      <mesh position={[0, 0.46, 0.18]} scale={[1.08, 0.06, 0.06]} castShadow><boxGeometry /><meshStandardMaterial color="#e0e1d4" roughness={0.9} /></mesh>
      {balusters.map((x) => <mesh key={x} position={[x, 0.27, 0.18]} scale={[0.04, 0.22, 0.04]} castShadow><cylinderGeometry args={[1, 1.15, 2, 6]} /><meshStandardMaterial color="#d9dacd" roughness={0.92} /></mesh>)}
    </group>
  )
}

function Ivy({ position, scale, rotation = [0, 0, 0] }: { position: Point, scale: Point, rotation?: Point }) {
  return <mesh position={position} scale={scale} rotation={rotation} castShadow><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#64784f" roughness={1} flatShading /></mesh>
}

function ProceduralNorthBuilding() {
  const wingWindows = [-8, -7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 8]
  const brickCourses = [0.55, 1.05, 1.55, 2.05, 2.55]
  const towerBands = [0.4, 2.25, 4.65, 6.18]

  return (
    <group>
      <mesh position={[0, 0.25, 0]} scale={[9.05, 0.25, 1.72]} castShadow receiveShadow><boxGeometry /><meshStandardMaterial color="#c6c8bb" roughness={0.96} /></mesh>
      {[-5.25, 5.25].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.72, 0]} scale={[3.85, 1.45, 1.6]} castShadow receiveShadow><boxGeometry /><meshStandardMaterial color={brick} roughness={0.98} flatShading /></mesh>
          <HipRoof position={[x, 3.18, 0]} width={8.1} depth={3.72} height={1.02} />
        </group>
      ))}
      {brickCourses.map((y) => <mesh key={y} position={[0, y, 1.615]} scale={[8.75, 0.018, 0.02]}><boxGeometry /><meshStandardMaterial color="#849089" roughness={1} /></mesh>)}
      {wingWindows.map((x) => <group key={x}><Window position={[x, 1.03, 1.625]} /><Window position={[x, 2.18, 1.625]} /></group>)}

      <group position={[0, 0, 0.12]}>
        <mesh position={[0, 3.28, 0]} scale={[1.42, 3.05, 1.65]} castShadow receiveShadow><boxGeometry /><meshStandardMaterial color={brickDark} roughness={0.98} flatShading /></mesh>
        {towerBands.map((y) => <mesh key={y} position={[0, y, 0]} scale={[1.52, 0.08, 1.76]} castShadow><boxGeometry /><meshStandardMaterial color={stone} roughness={0.94} /></mesh>)}
        {[-1.18, 1.18].map((x) => <mesh key={x} position={[x, 3.25, 1.665]} scale={[0.08, 2.92, 0.06]}><boxGeometry /><meshStandardMaterial color={brickLight} roughness={1} /></mesh>)}
        <ArchedEntrance />
        <Window position={[0, 3.02, 1.665]} scale={[0.25, 0.42, 0.05]} />
        <Window position={[0, 4.08, 1.665]} scale={[0.25, 0.42, 0.05]} />
        {[-0.68, 0, 0.68].map((x) => <Window key={x} position={[x, 5.3, 1.665]} scale={[0.2, 0.34, 0.05]} />)}
        <StoneBalcony />
        <ClockFace />
        <mesh position={[0, 6.36, 0]} scale={[1.62, 0.12, 1.86]} castShadow><boxGeometry /><meshStandardMaterial color={roofEdge} roughness={0.94} /></mesh>
        <HipRoof position={[0, 6.5, 0]} width={3.45} depth={3.85} height={0.95} />
        <mesh position={[0, 7.52, 0]} scale={[0.06, 0.34, 0.06]} castShadow><boxGeometry /><meshStandardMaterial color={roofEdge} /></mesh>
        <mesh position={[0, 7.73, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.3, 0.05, 0.05]} castShadow><boxGeometry /><meshStandardMaterial color={roofEdge} /></mesh>
      </group>

      {[0, 1, 2, 3].map((step) => <mesh key={step} position={[0, 0.12 + step * 0.1, 2.15 - step * 0.22]} scale={[1.25 - step * 0.06, 0.1, 0.3]} receiveShadow castShadow><boxGeometry /><meshStandardMaterial color="#c9cabd" roughness={0.96} /></mesh>)}
      <Ivy position={[-1.35, 3.15, 1.72]} scale={[0.22, 1.6, 0.12]} rotation={[0, 0, -0.12]} />
      <Ivy position={[1.32, 2.65, 1.72]} scale={[0.2, 1.25, 0.11]} rotation={[0, 0, 0.16]} />
      <Ivy position={[-7.35, 1.55, 1.65]} scale={[0.18, 0.9, 0.1]} rotation={[0, 0, -0.08]} />
      <Ivy position={[6.45, 1.35, 1.65]} scale={[0.16, 0.72, 0.09]} rotation={[0, 0, 0.1]} />
    </group>
  )
}

function LoadedNorthBuilding({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)
  const model = useMemo(() => scene.clone(true), [scene])
  useEffect(() => { model.traverse((child) => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true } }) }, [model])
  return <primitive object={model} />
}

export function NorthBuilding({ modelUrl }: ModelProps) {
  return <group position={[0, 0.22, -2.15]}>{modelUrl ? <Suspense fallback={<ProceduralNorthBuilding />}><LoadedNorthBuilding modelUrl={modelUrl} /></Suspense> : <ProceduralNorthBuilding />}</group>
}
