import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import northBuildingUrl from './models/north-building.glb?url'

/** Reference-built exterior. Reproduce the asset with npm run model:build. */
export function NorthBuilding() {
  const { scene } = useGLTF(northBuildingUrl)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  return <primitive object={model} position={[0, 0.22, -2.15]} />
}
