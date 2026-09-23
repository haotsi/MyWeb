import { RoundedBox } from '@react-three/drei'
import { Bench, Tree } from './GardenFurniture'

const floors = Array.from({ length: 7 }, (_, index) => index)
const frontBays = Array.from({ length: 15 }, (_, index) => index)
const sideBays = Array.from({ length: 7 }, (_, index) => index)

function Facade() {
  return (
    <group position={[0, 0, -1.05]}>
      <mesh position={[0, 3.64, 0]} castShadow receiveShadow>
        <boxGeometry args={[13.5, 6.65, 6.8]} />
        <meshStandardMaterial color="#c6c9c2" roughness={0.83} />
      </mesh>
      <mesh position={[0, 3.88, 3.43]}>
        <boxGeometry args={[12.55, 5.82, 0.07]} />
        <meshStandardMaterial color="#577986" metalness={0.23} roughness={0.28} />
      </mesh>
      <mesh position={[0, 3.88, -3.43]}>
        <boxGeometry args={[12.55, 5.82, 0.07]} />
        <meshStandardMaterial color="#577986" metalness={0.23} roughness={0.28} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 6.79, 3.73, 0]}>
            <boxGeometry args={[0.07, 6.33, 6.45]} />
            <meshStandardMaterial color="#a8b7b3" metalness={0.12} roughness={0.38} />
          </mesh>
          {sideBays.map((bay) => (
            <mesh key={bay} position={[side * 6.85, 3.65, -2.82 + bay * 0.94]} castShadow>
              <boxGeometry args={[0.12, 6.35, 0.055]} />
              <meshStandardMaterial color="#e4e2d8" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {floors.map((floor) => {
        const y = 1.0 + floor * 0.87
        return (
          <group key={floor}>
            <mesh position={[0, y, 3.56]} castShadow>
              <boxGeometry args={[13.75, 0.105, 0.37]} />
              <meshStandardMaterial color="#dfded2" roughness={0.76} />
            </mesh>
            <mesh position={[0, y, -3.55]} castShadow>
              <boxGeometry args={[13.75, 0.1, 0.3]} />
              <meshStandardMaterial color="#d2d4cb" roughness={0.76} />
            </mesh>
            <mesh position={[0, y - 0.27, 3.6]}>
              <boxGeometry args={[13.3, 0.055, 0.46]} />
              <meshStandardMaterial color="#9baba6" roughness={0.7} />
            </mesh>
          </group>
        )
      })}
      {frontBays.map((bay) => {
        const x = -6.27 + bay * 0.895
        return (
          <group key={bay}>
            <mesh position={[x, 3.86, 3.55]} castShadow>
              <boxGeometry args={[0.073, 5.9, 0.14]} />
              <meshStandardMaterial color="#e5e5db" roughness={0.65} />
            </mesh>
            <mesh position={[x, 3.86, -3.55]}>
              <boxGeometry args={[0.07, 5.9, 0.13]} />
              <meshStandardMaterial color="#d1d6cf" roughness={0.65} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[-3.15, 3.67, 3.72]} castShadow>
        <boxGeometry args={[0.22, 6.37, 0.19]} />
        <meshStandardMaterial color="#8d514d" roughness={0.75} />
      </mesh>
      <mesh position={[3.15, 3.67, 3.72]} castShadow>
        <boxGeometry args={[0.22, 6.37, 0.19]} />
        <meshStandardMaterial color="#8d514d" roughness={0.75} />
      </mesh>
      <mesh position={[0, 7.04, 0]} castShadow>
        <boxGeometry args={[14.05, 0.28, 7.32]} />
        <meshStandardMaterial color="#e2e1d6" roughness={0.85} />
      </mesh>
      <mesh position={[0, 7.24, 0]} castShadow>
        <boxGeometry args={[12.7, 0.16, 6.2]} />
        <meshStandardMaterial color="#67746f" roughness={0.77} />
      </mesh>
      <mesh position={[0, 7.36, 0]} castShadow>
        <boxGeometry args={[3.4, 0.16, 2.1]} />
        <meshStandardMaterial color="#b5c8c5" metalness={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.52, 3.5]}>
        <boxGeometry args={[4.5, 1.04, 0.08]} />
        <meshStandardMaterial color="#456775" metalness={0.25} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.92, 4.02]} castShadow>
        <boxGeometry args={[5.7, 0.13, 1.2]} />
        <meshStandardMaterial color="#deded2" roughness={0.8} />
      </mesh>
      {[-2.45, 2.45].map((x) => (
        <mesh key={x} position={[x, 0.46, 4.45]} castShadow>
          <boxGeometry args={[0.12, 0.91, 0.13]} />
          <meshStandardMaterial color="#d6d4c9" roughness={0.84} />
        </mesh>
      ))}
    </group>
  )
}

export function SuzhouLibrary() {
  return (
    <group>
      <RoundedBox args={[21, 0.75, 17]} radius={0.34} smoothness={3} position={[0, -0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#b9c8c1" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[20.1, 0.38, 16.1]} radius={0.24} smoothness={2} position={[0, 0.05, 0]} receiveShadow>
        <meshStandardMaterial color="#adc3ac" roughness={1} />
      </RoundedBox>
      <mesh position={[0, 0.28, -0.85]} receiveShadow>
        <boxGeometry args={[15.5, 0.15, 9.7]} />
        <meshStandardMaterial color="#d7d8cb" roughness={0.98} />
      </mesh>
      <Facade />
      <mesh position={[0, 0.28, 5.65]} receiveShadow>
        <boxGeometry args={[5.6, 0.09, 5.0]} />
        <meshStandardMaterial color="#d9d8cc" roughness={0.95} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => (
        <mesh key={index} position={[0, 0.345, 3.3 + index * 0.75]} receiveShadow>
          <boxGeometry args={[5.45, 0.016, 0.035]} />
          <meshStandardMaterial color="#abb8ad" />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 8.4, 0.285, 0.8]} receiveShadow>
            <boxGeometry args={[2.1, 0.05, 7.9]} />
            <meshStandardMaterial color="#799aa0" metalness={0.2} roughness={0.34} />
          </mesh>
          <mesh position={[side * 9.4, 0.37, 0.8]}>
            <boxGeometry args={[0.09, 0.18, 8.1]} />
            <meshStandardMaterial color="#e5e6d9" roughness={0.95} />
          </mesh>
          <Tree position={[side * 8.45, 0.25, -5.25]} scale={0.78} />
          <Tree position={[side * 8.45, 0.25, 5.95]} scale={0.72} autumn={side === 1} />
          <Bench position={[side * 7.15, 0.33, 5.4]} rotation={side * 0.16} />
        </group>
      ))}
      <mesh position={[0, -0.83, 0]} receiveShadow>
        <planeGeometry args={[45, 42]} />
        <shadowMaterial transparent opacity={0.18} color="#53685d" />
      </mesh>
    </group>
  )
}
