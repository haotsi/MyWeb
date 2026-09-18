import { readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import assert from 'node:assert/strict'
import * as T from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// Exercise the same loader used by the website, rather than only the generator.
const bytes=await readFile('src/scene/models/north-building.glb')
const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)
const {scene}=await new GLTFLoader().parseAsync(buffer,'')
const bounds=new T.Box3().setFromObject(scene)
const size=bounds.getSize(new T.Vector3())
assert(bounds.min.y>-.001,'Model must sit on the ground, not sink below it')
assert(size.x>15&&size.x<17&&size.y>7&&size.y<8&&size.z<7,'Model must fit the campus and reference proportions')
let triangles=0,meshes=0
scene.traverse(mesh=>{
  if(!mesh.isMesh)return
  meshes++
  const g=mesh.geometry
  assert(g.index,'Merged model must use indexed geometry')
  triangles+=g.index.count/3
  for(const attribute of Object.values(g.attributes)) assert(attribute.array.every(Number.isFinite),`Invalid geometry in ${mesh.name}`)
  assert(g.index.array.every(i=>i<g.attributes.position.count),`Out-of-range index in ${mesh.name}`)
  if(mesh.name.startsWith('tile')){
    const p=g.attributes.position
    for(let i=0;i<p.count;i++){
      assert(!(Math.abs(p.getX(i))<1&&p.getY(i)>2.3&&p.getY(i)<2.95&&p.getZ(i)>2.47),'Wing roof must not cross the entrance tower')
    }
  }
})
assert(meshes<=18,'Keep material batches bounded')
assert(triangles<120000,'Model exceeds geometry budget')
console.log(JSON.stringify({result:'passed',loader:'GLTFLoader',meshes,triangles,bytes:bytes.length,gzipBytes:gzipSync(bytes).length,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}},null,2))
