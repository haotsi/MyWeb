import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

type Point = [number, number, number]

function branch(a: Point, b: Point, bottom: number, top: number) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b)
  const direction = end.clone().sub(start)
  const geometry = new THREE.CylinderGeometry(top, bottom, direction.length(), 7)
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()))
  return geometry.translate(...start.add(end).multiplyScalar(.5).toArray() as Point)
}

function merge(parts: THREE.BufferGeometry[]) {
  const geometry = mergeGeometries(parts)
  parts.forEach(part => part.dispose())
  return geometry
}

export function Tree({ position, scale = 1, autumn = false }: { position: Point, scale?: number, autumn?: boolean }) {
  const geometry = useMemo(() => {
    let seed = Math.abs(Math.round(position[0] * 137 + position[2] * 83)) + 19
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
    const wood: THREE.BufferGeometry[] = [], leaves: THREE.BufferGeometry[] = []
    wood.push(branch([0, 0, 0], [.07, 1.1, .035], .19, .12), branch([.07, 1.1, .035], [-.04, 2.65, -.05], .12, .043))
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3
      wood.push(branch([Math.cos(a) * .34, .035, Math.sin(a) * .34], [0, .45, 0], .048, .085))
    }
    for (let i = 0; i < 15; i++) {
      const angle = i * 2.399 + random() * .24
      const y = 1.3 + i * .095
      const radius = .75 + random() * .36
      const tip: Point = [Math.cos(angle) * radius, y + .65 + random() * .3, Math.sin(angle) * radius]
      const joint: Point = [tip[0] * .47, y + .23, tip[2] * .47]
      wood.push(branch([.035, y, 0], joint, .07, .045), branch(joint, tip, .045, .015))
      for (let fork = 0; fork < 3; fork++) {
        const end: Point = [tip[0] + (random() - .5) * .6, tip[1] + .1 + random() * .4, tip[2] + (random() - .5) * .6]
        wood.push(branch(joint, end, .025, .006))
        for (let j = 0; j < 7; j++) {
          const leaf = new THREE.IcosahedronGeometry(.14 + random() * .15, 0)
          leaf.scale(1.15, .7 + random() * .3, 1)
          leaf.rotateY(random() * Math.PI).rotateZ(random() * .45)
          leaf.translate(end[0] + (random() - .5) * .52, end[1] + (random() - .5) * .45, end[2] + (random() - .5) * .52)
          const palette = autumn ? ['#78814a', '#939454', '#abb16b', '#657b49'] : ['#3f6743', '#577b4a', '#709257', '#839c61']
          const color = new THREE.Color(palette[Math.floor(random() * palette.length)])
          const colors = new Float32Array(leaf.attributes.position.count * 3)
          for (let k = 0; k < colors.length; k += 3) color.toArray(colors, k)
          leaf.setAttribute('color', new THREE.BufferAttribute(colors, 3))
          leaves.push(leaf)
        }
      }
    }
    return { wood: merge(wood), leaves: merge(leaves) }
  }, [position[0], position[2], autumn])
  useEffect(() => () => { geometry.wood.dispose(); geometry.leaves.dispose() }, [geometry])
  return <group position={position} scale={scale}>
    <mesh geometry={geometry.wood} castShadow receiveShadow><meshStandardMaterial color="#6b5945" roughness={1} /></mesh>
    <mesh geometry={geometry.leaves} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={1} flatShading /></mesh>
  </group>
}

export function Bench({ position, rotation = 0 }: { position: Point, rotation?: number }) {
  const geometry = useMemo(() => {
    const wood: THREE.BufferGeometry[] = [], metal: THREE.BufferGeometry[] = [], bolts: THREE.BufferGeometry[] = []
    const plank = (x: number, y: number, z: number, w: number, h: number, d: number, tilt = 0) => {
      wood.push(new THREE.BoxGeometry(w, h, d).rotateX(tilt).translate(x, y, z))
    }
    // Full dimensions: the seat spans both supports, with narrow, regular gaps.
    for (let i = 0; i < 5; i++) plank(0, .48, -.23 + i * .115, 1.78, .065, .094)
    for (let i = 0; i < 4; i++) plank(0, .64 + i * .13, -.29 - i * .024, 1.78, .104, .055, -.18)
    for (const x of [-.66, .66]) {
      for (const z of [-.22, .22]) {
        metal.push(branch([x, .035, z * 1.22], [x, .45, z], .032, .029))
        metal.push(new THREE.BoxGeometry(.13, .03, .13).translate(x, .015, z * 1.22))
      }
      metal.push(branch([x, .43, -.3], [x, .43, .29], .035, .035))
      metal.push(branch([x, .39, -.25], [x, 1.09, -.39], .029, .029))
      metal.push(branch([x, .47, .20], [x, .72, .16], .026, .026))
      metal.push(branch([x, .72, .16], [x, .74, -.33], .026, .026))
      plank(x, .765, -.06, .105, .045, .48)
      for (let i = 0; i < 4; i++) bolts.push(new THREE.SphereGeometry(.018, 6, 4).scale(1, 1, .4).translate(x, .64 + i * .13, -.252 - i * .024))
    }
    metal.push(branch([-.66, .25, -.19], [.66, .25, -.19], .025, .025))
    return { wood: merge(wood), metal: merge(metal), bolts: merge(bolts) }
  }, [])
  useEffect(() => () => Object.values(geometry).forEach(g => g.dispose()), [geometry])
  return <group position={position} rotation={[0, rotation, 0]}>
    <mesh geometry={geometry.wood} castShadow receiveShadow><meshStandardMaterial color="#977050" roughness={.86} /></mesh>
    <mesh geometry={geometry.metal} castShadow receiveShadow><meshStandardMaterial color="#35453e" metalness={.35} roughness={.7} /></mesh>
    <mesh geometry={geometry.bolts}><meshStandardMaterial color="#a69d82" metalness={.6} roughness={.5} /></mesh>
  </group>
}
