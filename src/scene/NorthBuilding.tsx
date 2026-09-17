import { RoundedBox, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'

const brick = '#66716b'
const brickDark = '#4e5d57'
const roof = '#354b43'
const stone = '#d8d9c8'
const wood = '#784b32'

type ModelProps = {
  modelUrl?: string
}

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
      -w, 0, -d, w, 0, -d, w, 0, d, -w, 0, d,
      -w, height, 0, w, height, 0,
    ])
    const shape = new THREE.BufferGeometry()
    shape.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    shape.setIndex([
      0, 1, 5, 0, 5, 4,
      3, 4, 5, 3, 5, 2,
      0, 4, 3, 1, 2, 5,
      0, 3, 2, 0, 2, 1,
    ])
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
      {[-depth / 2 - 0.08, depth / 2 + 0.08].map((z) => (
        <mesh key={z} position={[0, 0.02, z]} scale={[width / 2 + 0.28, 0.07, 0.12]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="#263a33" roughness={0.9} />
        </mesh>
      ))}
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

function ProceduralNorthBuilding() {
  const wingWindows = [-6.5, -5.45, -4.4, -3.35, 3.35, 4.4, 5.45, 6.5]
  const towerBands = [1.04, 3.82, 5.44]

  return (
    <group>
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
        {[-1.28, 1.28].map((x) => (
          <mesh key={x} position={[x, 3.05, 1.82]} scale={[0.11, 2.55, 0.1]} castShadow>
            <boxGeometry />
            <meshStandardMaterial color="#718078" roughness={0.96} />
          </mesh>
        ))}
        {towerBands.map((y) => (
          <mesh key={y} position={[0, y, 0]} scale={[1.68, 0.1, 1.94]} castShadow>
            <boxGeometry />
            <meshStandardMaterial color={stone} roughness={0.92} />
          </mesh>
        ))}
        <mesh position={[0, 1.28, 1.82]} scale={[0.78, 1.15, 0.12]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color={wood} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.72, 1.96]} scale={[1.3, 0.15, 0.28]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color={stone} />
        </mesh>
        {[-0.72, 0, 0.72].map((x) => <Window key={`lower-${x}`} position={[x, 3.05, 1.795]} scale={[0.28, 0.62, 0.06]} />)}
        {[-0.72, 0, 0.72].map((x) => <Window key={`upper-${x}`} position={[x, 4.45, 1.795]} scale={[0.25, 0.5, 0.06]} />)}
        <mesh position={[0, 5.76, 0]} scale={[1.78, 0.15, 2.02]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="#263a33" roughness={0.92} />
        </mesh>
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

function LoadedNorthBuilding({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)
  const model = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [model])

  return <primitive object={model} />
}

export function NorthBuilding({ modelUrl }: ModelProps) {
  return (
    <group position={[0, 0.22, -2.15]}>
      {modelUrl ? (
        <Suspense fallback={<ProceduralNorthBuilding />}>
          <LoadedNorthBuilding modelUrl={modelUrl} />
        </Suspense>
      ) : <ProceduralNorthBuilding />}
    </group>
  )
}
