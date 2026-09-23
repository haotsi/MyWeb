import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Tree } from './GardenFurniture'

// Exterior massing follows NJU's description of two groups and a north-south atrium,
// plus the architect's four U-shaped teaching courts and planted roof spine.
// https://slle.nju.edu.cn/fxljy/szpxzx/szpxzxgk/bxtj/20240708/i270318.html
// https://www.artsgroup.cn/zhonghengdongtai/zhonghengxinwen/2024-01-22/569.html

const cube = new THREE.BoxGeometry(1, 1, 1)
const brick = new THREE.MeshStandardMaterial({ color: '#777d79', roughness: 0.95 })
const brickLight = new THREE.MeshStandardMaterial({ color: '#a8ada5', roughness: 0.94 })
const brickDark = new THREE.MeshStandardMaterial({ color: '#555f5d', roughness: 0.9 })
const frame = new THREE.MeshStandardMaterial({ color: '#90534e', roughness: 0.74 })
const glass = new THREE.MeshStandardMaterial({ color: '#54727b', metalness: 0.24, roughness: 0.25 })
const atriumGlass = new THREE.MeshStandardMaterial({ color: '#7daba9', metalness: 0.2, roughness: 0.28, transparent: true, opacity: 0.75, depthWrite: false })
const concrete = new THREE.MeshStandardMaterial({ color: '#d8d8ca', roughness: 0.95 })
const paving = new THREE.MeshStandardMaterial({ color: '#c5c7b9', roughness: 0.98 })
const grass = new THREE.MeshStandardMaterial({ color: '#829f73', roughness: 1 })

type Point = [number, number, number]

function Box({ position, size, material, rotation, shadow = false }: {
  position: Point
  size: Point
  material: THREE.Material
  rotation?: Point
  shadow?: boolean
}) {
  return <mesh geometry={cube} material={material} position={position} scale={size} rotation={rotation} castShadow={shadow} receiveShadow />
}

function TeachingWing({ x, z, width, depth, height }: {
  x: number
  z: number
  width: number
  depth: number
  height: number
}) {
  const levels = [0, 1, 2, 3, 4]
  const xBays = Math.max(2, Math.round(width / 0.95))
  const zBays = Math.max(2, Math.round(depth / 0.95))
  const floorHeight = height / 5

  return (
    <group>
      <Box position={[x, 0.31 + height / 2, z]} size={[width, height, depth]} material={brick} shadow />
      <Box position={[x, 0.31, z]} size={[width + 0.12, 0.17, depth + 0.12]} material={brickLight} />
      <Box position={[x, 0.34 + height, z]} size={[width + 0.25, 0.19, depth + 0.25]} material={brickDark} shadow />
      {levels.map((floor) => {
        const y = 0.47 + floor * floorHeight + floorHeight * 0.44
        return (
          <group key={floor}>
            {[-1, 1].map((side) => (
              <group key={side}>
                <Box position={[x, y, z + side * (depth / 2 + 0.017)]} size={[width - 0.24, floorHeight * 0.53, 0.045]} material={frame} />
                <Box position={[x, y, z + side * (depth / 2 + 0.048)]} size={[width - 0.37, floorHeight * 0.43, 0.045]} material={glass} />
                <Box position={[x + side * (width / 2 + 0.017), y, z]} size={[0.045, floorHeight * 0.53, depth - 0.24]} material={frame} />
                <Box position={[x + side * (width / 2 + 0.048), y, z]} size={[0.045, floorHeight * 0.43, depth - 0.37]} material={glass} />
              </group>
            ))}
          </group>
        )
      })}
      {Array.from({ length: xBays - 1 }, (_, index) => {
        const bayX = x - width / 2 + (index + 1) * width / xBays
        return [-1, 1].map((side) => (
          <Box key={`${index}-${side}`} position={[bayX, 0.31 + height / 2, z + side * (depth / 2 + 0.07)]} size={[0.095, height - 0.32, 0.1]} material={frame} />
        ))
      })}
      {Array.from({ length: zBays - 1 }, (_, index) => {
        const bayZ = z - depth / 2 + (index + 1) * depth / zBays
        return [-1, 1].map((side) => (
          <Box key={`${index}-${side}`} position={[x + side * (width / 2 + 0.07), 0.31 + height / 2, bayZ]} size={[0.1, height - 0.32, 0.095]} material={frame} />
        ))
      })}
      {levels.slice(0, 4).map((floor) => (
        <group key={floor}>
          <Box position={[x, 0.42 + (floor + 1) * floorHeight, z]} size={[width + 0.13, 0.085, depth + 0.13]} material={brickLight} />
        </group>
      ))}
    </group>
  )
}

function Courtyard({ side, row }: { side: -1 | 1, row: -1 | 1 }) {
  const x = side * 4.35
  const z = row * 3.1
  return (
    <group>
      <Box position={[x, 0.39, z]} size={[3.85, 0.09, 2.93]} material={concrete} />
      <Box position={[x, 0.45, z]} size={[2.9, 0.03, 2.15]} material={grass} />
      <Box position={[x, 0.47, z]} size={[0.52, 0.035, 2.4]} material={paving} />
      <Tree position={[x + side * 0.95, 0.48, z - 0.48]} scale={0.38} autumn={row === 1} />
    </group>
  )
}

function RoofGarden({ side, row }: { side: -1 | 1, row: -1 | 1 }) {
  const x = side * 4.8
  const z = row * 5.25
  const height = row === 1 ? 3.82 : 4.5
  return (
    <group>
      <Box position={[x, 0.46 + height, z]} size={[4.4, 0.07, 0.87]} material={grass} />
      <Box position={[x, 0.51 + height, z]} size={[0.54, 0.025, 0.9]} material={paving} />
      {[-1, 1].map((step) => (
        <Box key={step} position={[x + step * 1.75, 0.54 + height, z]} size={[0.38, 0.16, 0.6]} material={brickLight} />
      ))}
    </group>
  )
}

function StudyGroup({ side, row }: { side: -1 | 1, row: -1 | 1 }) {
  const z = row * 3.1
  return (
    <group>
      <TeachingWing x={side * 7.15} z={z} width={1.52} depth={5.55} height={4.72} />
      <TeachingWing x={side * 4.8} z={z - 2.15} width={5.15} depth={1.25} height={4.5} />
      <TeachingWing x={side * 4.8} z={z + 2.15} width={5.15} depth={1.25} height={row === 1 ? 3.82 : 4.5} />
      <Courtyard side={side} row={row} />
      <RoofGarden side={side} row={row} />
    </group>
  )
}

function CentralAtrium() {
  return (
    <group>
      <Box position={[0, 1.4, 0]} size={[3.05, 2.18, 11.68]} material={atriumGlass} />
      {[-1.42, 1.42].map((x) => (
        <Box key={x} position={[x, 1.45, 0]} size={[0.085, 2.35, 11.78]} material={brickLight} />
      ))}
      {[-4.7, -3.15, -1.6, 0, 1.6, 3.15, 4.7].map((z) => (
        <Box key={z} position={[0, 1.45, z]} size={[3.12, 0.08, 0.085]} material={brickLight} />
      ))}
      <group position={[0, 2.65, -0.2]} rotation={[0.22, 0, 0]}>
        <Box position={[0, 0, 0]} size={[3.45, 0.2, 10.05]} material={concrete} shadow />
        <Box position={[0, 0.12, 0]} size={[3.1, 0.035, 9.7]} material={grass} />
        <Box position={[0, 0.15, 0]} size={[0.96, 0.035, 9.45]} material={paving} />
        {[-1.69, 1.69].map((x) => (
          <Box key={x} position={[x, 0.22, 0]} size={[0.085, 0.28, 10.1]} material={brickLight} />
        ))}
        {[-3.3, -1.9, -0.5, 0.9, 2.3, 3.7].map((z) => (
          <Box key={z} position={[0, 0.18, z]} size={[0.96, 0.025, 0.045]} material={brickLight} />
        ))}
      </group>
      <Box position={[0, 0.58, 5.97]} size={[2.25, 0.8, 0.085]} material={glass} />
      <Box position={[0, 1.05, 6.1]} size={[3.2, 0.13, 1.0]} material={concrete} shadow />
    </group>
  )
}

export function NanyongBuilding() {
  return (
    <group>
      <RoundedBox args={[22.5, 0.76, 19.5]} radius={0.3} smoothness={3} position={[0, -0.4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#bfc6b7" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[21.7, 0.32, 18.7]} radius={0.2} smoothness={2} position={[0, 0.06, 0]} receiveShadow>
        <meshStandardMaterial color="#9eb188" roughness={1} />
      </RoundedBox>
      <Box position={[0, 0.25, 0]} size={[18.3, 0.17, 13.85]} material={concrete} />
      {([-1, 1] as const).map((side) => ([-1, 1] as const).map((row) => (
        <StudyGroup key={`${side}-${row}`} side={side} row={row} />
      )))}
      <CentralAtrium />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box position={[side * 5.1, 1.38, 6.55]} size={[5.7, 0.14, 0.97]} material={brickDark} shadow />
          {[-2.4, -1.45, -0.5, 0.5, 1.45, 2.4].map((offset) => (
            <Box key={offset} position={[side * 5.1 + offset, 0.81, 6.9]} size={[0.14, 1.05, 0.14]} material={brickLight} shadow />
          ))}
          <Tree position={[side * 10.0, 0.24, -5.9]} scale={0.52} />
          <Tree position={[side * 10.0, 0.24, 5.25]} scale={0.5} />
        </group>
      ))}
      {/* Keep the U-shaped teaching entrance open as one paved forecourt. */}
      <Box position={[0, 0.265, 8.06]} size={[18.3, 0.12, 2.71]} material={paving} />
      <Box position={[0, 0.332, 8.06]} size={[3.05, 0.015, 2.71]} material={concrete} />
      <mesh position={[0, -0.82, 0]} receiveShadow>
        <planeGeometry args={[45, 42]} />
        <shadowMaterial transparent opacity={0.18} color="#53685d" />
      </mesh>
    </group>
  )
}
