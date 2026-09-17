import { Suspense, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Html, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { CampusScene } from './CampusScene'
import type { CampusModuleId } from '../navigation'

function SceneLoader() {
  return (
    <Html center>
      <div className="scene-loader" role="status" aria-label="正在搭建数字校园">
        <span />
        <p>正在搭建数字校园</p>
      </div>
    </Html>
  )
}

function CameraRig({ controls, focusTarget, cameraPosition }: {
  controls: RefObject<OrbitControlsImpl | null>
  focusTarget: [number, number, number] | null
  cameraPosition: [number, number, number] | null
}) {
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())

  useFrame(({ camera }, delta) => {
    if (!focusTarget || !cameraPosition || !controls.current) return
    desiredPosition.current.set(...cameraPosition)
    desiredTarget.current.set(...focusTarget)
    const amount = 1 - Math.exp(-delta * 3.8)
    camera.position.lerp(desiredPosition.current, amount)
    controls.current.target.lerp(desiredTarget.current, amount)
    controls.current.update()
  })
  return null
}

export default function CampusCanvas({ quality, onQualityDecline, activeModule, focusTarget, cameraPosition }: {
  quality: 'high' | 'low'
  onQualityDecline: () => void
  activeModule: CampusModuleId | null
  focusTarget: [number, number, number] | null
  cameraPosition: [number, number, number] | null
}) {
  const controls = useRef<OrbitControlsImpl | null>(null)
  return (
    <Canvas
      className="campus-canvas"
      orthographic
      shadows={quality === 'high'}
      dpr={quality === 'high' ? [1, 1.75] : 1}
      camera={{ position: [18, 15, 20], zoom: 42, near: 0.1, far: 100 }}
      gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor onDecline={onQualityDecline} />
      <color attach="background" args={['#edf3ef']} />
      <fog attach="fog" args={['#edf3ef', 31, 55]} />
      <ambientLight intensity={1.25} />
      <directionalLight
        castShadow={quality === 'high'}
        position={[-8, 18, 12]}
        intensity={2.5}
        color="#fff9df"
        shadow-mapSize-width={quality === 'high' ? 2048 : 512}
        shadow-mapSize-height={quality === 'high' ? 2048 : 512}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <Suspense fallback={<SceneLoader />}>
        <CampusScene lowQuality={quality === 'low'} activeModule={activeModule} />
        {quality === 'high' && <Environment preset="city" environmentIntensity={0.18} />}
      </Suspense>
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        minZoom={32}
        maxZoom={62}
        minPolarAngle={Math.PI / 4.1}
        maxPolarAngle={Math.PI / 2.55}
        minAzimuthAngle={-Math.PI / 4.2}
        maxAzimuthAngle={Math.PI / 4.2}
        target={[0, 1.25, 0]}
        enableDamping
        dampingFactor={0.055}
      />
      <CameraRig controls={controls} focusTarget={focusTarget} cameraPosition={cameraPosition} />
    </Canvas>
  )
}
