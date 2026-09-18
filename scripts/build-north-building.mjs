/**
 * North Building, Nanjing University — a measured-proportion exterior study.
 * Reference register and deliberate simplifications: docs/north-building-model.md.
 * Run: node scripts/build-north-building.mjs
 * Geometry is authored here and exported to GLB; no network or DCC is required.
 */
import * as T from 'three'
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { mkdir, writeFile } from 'node:fs/promises'

class NodeFileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer()
    this.onloadend?.()
  }
}
globalThis.FileReader = NodeFileReader

const root = new T.Group()
root.name = 'NJU_North_Building'
root.userData = { reference: 'https://historymuseum.nju.edu.cn/info/1201/10711.htm', units: 'normalized, main wall width = 15', reconstruction: 'reference-based, not a survey' }
const definitions = {
  masonry: { color: '#ffffff', vertexColors: true, roughness: .96 },
  mortar: { color: '#535a59', roughness: 1 },
  stone: { color: '#c4c3b4', roughness: .92 },
  stoneLight: { color: '#d7d4c5', roughness: .86 },
  tile: { color: '#535957', roughness: .9 },
  tileLight: { color: '#707571', roughness: .9 },
  tileDark: { color: '#343e3c', roughness: .96 },
  timber: { color: '#684039', roughness: .88 },
  windowFrame: { color: '#c5c3b2', roughness: .82 },
  glass: { color: '#637c7d', roughness: .38, metalness: .18 },
  recess: { color: '#283936', roughness: 1 },
  gold: { color: '#b28b48', roughness: .86 },
  red: { color: '#ad252d', roughness: .75 },
  leaf: { color: '#ffffff', vertexColors: true, side: T.DoubleSide, roughness: 1 },
  vine: { color: '#625f42', roughness: 1 },
}
const buckets = Object.fromEntries(Object.keys(definitions).map(k => [k, []]))
let frame = new T.Matrix4()
let seed = 1919
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
function add(material, geometry, color) {
  geometry.deleteAttribute('uv')
  geometry.applyMatrix4(frame)
  if (definitions[material].vertexColors) {
    const c = new T.Color(color ?? '#ffffff')
    const values = new Float32Array(geometry.attributes.position.count * 3)
    for (let i = 0; i < values.length; i += 3) c.toArray(values, i)
    geometry.setAttribute('color', new T.BufferAttribute(values, 3))
  }
  buckets[material].push(geometry.index ? geometry.toNonIndexed() : geometry)
}
function box(material, x, y, z, w, h, d, color) {
  add(material, new T.BoxGeometry(w, h, d).translate(x, y, z), color)
}
function polygon(material, points, color) {
  const p = []
  for (let i = 1; i < points.length - 1; i++) p.push(...points[0], ...points[i], ...points[i + 1])
  const g = new T.BufferGeometry()
  g.setAttribute('position', new T.Float32BufferAttribute(p, 3))
  g.computeVertexNormals()
  add(material, g, color)
}
function tube(material, points, radius = .018, segments = 10, radial = 5) {
  const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)))
  add(material, new T.TubeGeometry(curve, segments, radius, radial, false))
}
function cylinder(material, x, y, z, radius, height, rotateZ = 0) {
  add(material, new T.CylinderGeometry(radius, radius, height, 12).rotateZ(rotateZ).translate(x, y, z))
}
function inFrame(x, z, angle, callback) {
  const previous = frame
  frame = new T.Matrix4().makeTranslation(x, 0, z).multiply(new T.Matrix4().makeRotationY(angle))
  callback()
  frame = previous
}

// Facade cladding: individually colored brick faces, with staggered joints.
function bricks(width, height, z, bottom = .18, masks = []) {
  const pitchX = .235, pitchY = .078
  for (let row = 0; row < Math.ceil(height / pitchY); row++) {
    const y0 = bottom + row * pitchY + .005
    const y1 = Math.min(bottom + height, y0 + pitchY - .009)
    for (let col = -1; col < Math.ceil(width / pitchX) + 1; col++) {
      const x0 = Math.max(-width / 2, -width / 2 + (col + (row % 2) * .5) * pitchX + .004)
      const x1 = Math.min(width / 2, -width / 2 + (col + 1 + (row % 2) * .5) * pitchX - .004)
      if (x1 <= x0 || y1 <= y0) continue
      const tone = .39 + random() * .105
      const c = new T.Color().setRGB(tone * .96, tone, tone * .97, T.SRGBColorSpace)
      let pieces = [[x0,y0,x1,y1]]
      for (const [x,y,w,h] of masks) {
        const l=x-w/2,r=x+w/2,b=y-h/2,t=y+h/2
        pieces=pieces.flatMap(([a,d,e,f])=>{
          if(e<=l||a>=r||f<=b||d>=t) return [[a,d,e,f]]
          const out=[],lo=Math.max(a,l),hi=Math.min(e,r)
          if(a<l) out.push([a,d,l,f])
          if(e>r) out.push([r,d,e,f])
          if(d<b) out.push([lo,d,hi,b])
          if(f>t) out.push([lo,t,hi,f])
          return out
        })
      }
      for(const [a,b,cx,d] of pieces) polygon('masonry',[[a,b,z],[cx,b,z],[cx,d,z],[a,d,z]],c)
    }
  }
}
function windowAt(x, y, z, w = .29, h = .65, columns = 2) {
  box('recess', x, y, z + .007, w + .055, h + .05, .022)
  box('glass', x, y, z + .025, w, h, .025)
  for (const side of [-1, 1]) {
    box('windowFrame', x + side * w / 2, y, z + .052, .023, h + .04, .042)
    box('windowFrame', x, y + side * h / 2, z + .051, w + .04, .022, .043)
  }
  for (let i = 1; i < columns; i++) box('windowFrame', x - w / 2 + w * i / columns, y, z + .055, .012, h, .025)
  for (let i = 1; i < 4; i++) box('windowFrame', x, y - h / 2 + h * i / 4, z + .06, w, i === 2 ? .022 : .011, .027)
  box('stone', x, y - h / 2 - .04, z + .055, w + .12, .055, .14)
  box('stone', x, y + h / 2 + .045, z + .035, w + .11, .055, .075)
}
function balcony(y, z, width = 1.32) {
  box('stone', 0, y, z + .11, width + .16, .09, .31)
  box('stoneLight', 0, y + .29, z + .25, width + .12, .055, .06)
  box('stone', 0, y + .075, z + .25, width + .06, .048, .055)
  for (let i = 0; i <= 6; i++) box('stoneLight', -width / 2 + i * width / 6, y + .175, z + .25, i % 2 === 0 ? .045 : .025, .23, .058)
  for (const x of [-width / 2, width / 2]) box('stone', x, y + .17, z + .13, .045, .25, .24)
}

// Stone plinth, paired wings and the projecting square tower.
box('stone', 0, .12, 0, 15.2, .24, 4.72)
box('mortar', 0, 1.18, 0, 15, 2.08, 4.6)
box('stone', 0, .32, 0, 15.06, .09, 4.65)
box('stone', 0, 1.27, 0, 15.06, .055, 4.66)
box('stone', 0, 2.2, 0, 15.15, .12, 4.72)
const wingXs = Array.from({ length: 11 }, (_, i) => 1.56 + i * .547)
for (const side of [0, Math.PI]) inFrame(0, 0, side, () => {
  const masks = wingXs.flatMap(x => [-x,x]).flatMap(x => [.76,1.77].map(y => [x,y,.35,.75]))
  bricks(15, 2.02, 2.304, .18, masks)
  for (const x of wingXs.flatMap(x => [-x,x])) for (const y of [.76,1.77]) windowAt(x, y, 2.312, .285, .66)
  for (const x of [-7.46, 7.46]) box('stone', x, 1.28, 2.345, .07, 1.8, .07)
})
for (const angle of [Math.PI / 2, -Math.PI / 2]) inFrame(0, 0, angle, () => {
  bricks(4.6, 2.02, 7.504, .18, [[0,.6,.58,.85],[0,1.67,.53,.98]])
  box('stoneLight', 0, .54, 7.55, .6, .87, .1)
  box('timber', 0, .54, 7.61, .44, .76, .045)
  box('windowFrame', 0, .54, 7.65, .025, .76, .024)
  windowAt(0, 1.67, 7.515, .42, .95)
  for (let step = 0; step < 3; step++) box('stone', 0, .04 + step * .045, 7.7 - step * .07, .77, .08, .35 - step * .07)
})

const towerZ = 1.27, towerW = 2.37, towerHalf = towerW / 2
box('mortar', 0, 2.92, towerZ, towerW, 5.84, towerW)
box('stone', 0, .12, towerZ, towerW + .12, .24, towerW + .12)
for (const angle of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) inFrame(0, towerZ, angle, () => {
  const front = angle === 0
  const openings = [[0,3.09,.45,.66],[0,4.35,.45,.65],...[-.42,0,.42].map(x=>[x,5.38,.37,.68])]
  if (front) openings.push([0,.7,1.12,1.08], ...[-.4,0,.4].map(x=>[x,1.84,.36,.67]))
  bricks(towerW, 5.5, towerHalf + .004, .2, openings)
  for (const x of [-1.025,1.025]) {
    box('mortar', x, 2.95, towerHalf + .025, .19, 5.58, .055)
    inFrame(Math.sin(angle) * (towerHalf + .059) + x * Math.cos(angle), towerZ + Math.cos(angle) * (towerHalf + .059) - x * Math.sin(angle), angle, () => bricks(.19,5.5,0,.2))
  }
  windowAt(0, 3.09, towerHalf + .008, .29, .55)
  windowAt(0, 4.35, towerHalf + .008, .29, .55)
  for (const x of [-.42,0,.42]) windowAt(x, 5.38, towerHalf + .014, .32, .63)
  balcony(5.02, towerHalf + .012, 1.36)
  for (const x of [-.48,.48]) box('stone',x,4.7,towerHalf+.022,.085,.085,.05)
  box('stone',0,5.79,towerHalf+.035,2.48,.065,.105)
  // Six bracket sets on each side correspond to the 24 under-eave groups.
  for (let i = 0; i < 6; i++) {
    const x = -.98 + i * .392
    box('timber', x, 5.84, towerHalf + .10, .06, .19, .14)
    box('stone', x, 5.9, towerHalf + .17, .16, .045, .26)
    box('tileDark', x, 5.95, towerHalf + .23, .21, .045, .28)
  }
  if (front) {
    for (const x of [-.4,0,.4]) windowAt(x,1.84,towerHalf+.016,.32,.64)
    balcony(1.45, towerHalf + .01, 1.32)
    box('recess',0,.72,towerHalf+.01,.93,1.02,.025)
    box('timber',0,.7,towerHalf+.04,.68,.93,.052)
    for (const x of [-.47,.47]) {
      box('stoneLight',x,.73,towerHalf+.10,.135,1.09,.22)
      box('stone',x,.22,towerHalf+.15,.2,.14,.27)
      box('stone',x,1.22,towerHalf+.13,.2,.1,.26)
    }
    box('stoneLight',0,1.3,towerHalf+.11,1.22,.12,.24)
    box('stone',0,1.39,towerHalf+.1,1.38,.055,.29)
    for (const x of [-.17,.17]) {
      box('stone',x,.82,towerHalf+.074,.022,.71,.028)
      box('glass',x,.99,towerHalf+.076,.24,.29,.025)
      for (const y of [.35,.57]) box('timber',x,y,towerHalf+.08,.25,.16,.023)
      box('gold',x*.22,.67,towerHalf+.094,.014,.09,.028)
    }
    // Side lights in the rectangular stone entrance, not an invented arch.
    for (const x of [-.37,.37]) box('glass',x,.8,towerHalf+.075,.085,.76,.02)
  }
})
for (let i = 0; i < 5; i++) box('stone',0,.03+i*.035,3.05-i*.11,1.51-i*.02,.06+i*.07,.94-i*.11)
for (const x of [-.77,.77]) {
  box('stone',x,.12,2.81,.24,.22,.34)
  cylinder('stoneLight',x,.35,2.72,.18,.13,Math.PI/2)
}

// Curved four-sided eaves with continuous hip corners and visible tile rolls.
function skirt(width, depth, base, shoulder, innerW, innerD, cornerLift, tilePitch, cutSouth = false) {
  const surface = (side, u, t, wing = 0) => {
    const halfWidth = (1-t)*width/2 + t*innerW/2
    const x = wing ? wing * (1.205 + (u+1)/2 * (halfWidth-1.205)) : u*halfWidth
    const z = (1-t)*depth/2 + t*innerD/2
    const y = base + (shoulder-base)*Math.pow(t,1.65) + cornerLift*Math.pow(Math.abs(x/halfWidth),8)*Math.pow(1-t,2) + .032*Math.pow(1-t,8)
    return side === 0 ? [x,y,z] : side === 1 ? [-x,y,-z] : side === 2 ? [z,y,-x] : [-z,y,x]
  }
  for (let side = 0; side < 4; side++) {
    // Rotate a second, width/depth-swapped pair for the gable-end skirts.
    const swapped = side >= 2
    if (swapped) { [width,depth]=[depth,width]; [innerW,innerD]=[innerD,innerW] }
    for(const wing of cutSouth && side===0 ? [-1,1] : [0]) {
    const cols = 24, rows = 6
    for (let c=0;c<cols;c++) for (let r=0;r<rows;r++) {
      const u=-1+2*c/cols, v=-1+2*(c+1)/cols, a=r/rows,b=(r+1)/rows
      // Winding gives exterior-facing normals on all four slopes.
      const p=[surface(side,u,a,wing),surface(side,v,a,wing),surface(side,v,b,wing),surface(side,u,b,wing)]
      polygon('tile',wing<0?p.reverse():p)
    }
    const tileCount=Math.ceil((wing?width/2-1.205:width)/tilePitch)
    for (let c=0;c<=tileCount;c++) {
      const u=-1+2*c/tileCount
      const points=Array.from({length:7},(_,i)=>{const p=surface(side,u,i/6,wing);p[1]+=.018;return p})
      tube(c%5===0?'tileLight':'tile',points,.018,6,4)
    }
    tube('tileDark',Array.from({length:25},(_,i)=>surface(side,-1+i/12,0,wing)),.042,24,5)
    }
    if (swapped) { [width,depth]=[depth,width]; [innerW,innerD]=[innerD,innerW] }
  }
}
function ridgeOrnament(x, y, z, direction=1) {
  tube('tileLight',[[x-direction*.06,y,z],[x+direction*.13,y+.12,z],[x+direction*.16,y+.31,z],[x+direction*.03,y+.36,z],[x-direction*.03,y+.29,z]],.055,14,6)
  box('tileDark',x,y+.05,z,.16,.13,.16)
}

// Long main roof: hipped skirt plus two upper pitches and inset end gables.
skirt(16.05,5.35,2.34,2.93,13.5,2.86,.28,.115,true)
for (const sign of [-1,1]) {
  const point=(x,t)=>[x,2.93+1.10*Math.pow(t,1.16),sign*1.43*(1-t)]
  for(const [start,end] of sign>0?[[-6.75,-1.205],[1.205,6.75]]:[[-6.75,6.75]]) {
  const columns=1, rows=8
  for (let c=0;c<columns;c++) for(let r=0;r<rows;r++) {
    const x=start+c*(end-start)/columns,xx=start+(c+1)*(end-start)/columns,a=r/rows,b=(r+1)/rows
    const p=[point(x,a),point(xx,a),point(xx,b),point(x,b)]
    polygon('tile',sign>0?p:p.reverse())
  }
  const tileCount=Math.ceil((end-start)/.11)
  for(let c=0;c<=tileCount;c++) tube(c%6===0?'tileLight':'tile',Array.from({length:9},(_,r)=>{const p=point(start+c*(end-start)/tileCount,r/8);p[1]+=.018;return p}),.017,8,4)
  }
}
box('tileDark',0,4.055,0,13.7,.095,.115)
box('tileLight',0,4.105,0,13.65,.045,.08)
for(const sign of [-1,1]) {
  ridgeOrnament(sign*6.7,4.08,0,sign)
  inFrame(sign*6.753,0,sign*Math.PI/2,()=>{
    polygon('mortar',[[-1.43,2.925,0],[1.43,2.925,0],[0,4.03,0]])
    tube('stone',[[-1.45,2.935,.025],[0,4.04,.025],[1.45,2.935,.025]],.048,2,5)
    for(let row=0;row<4;row++) {
      const y=3.02+row*.16, w=1.7-row*.4
      box('recess',0,y,.022,w,.10,.025)
      for(let x=-w/2;x<w/2;x+=.12) box('stone',x,y,.044,.035,.10,.04)
    }
  })
}

inFrame(0,towerZ,0,()=>{
  box('tileDark',0,5.9,0,2.64,.105,2.64)
  skirt(3.30,3.30,5.96,6.32,2.16,2.16,.18,.095)
  // Intersection of two gables; four triangular pediments, not a pyramid.
  const h=1.08, top=7.07, shoulder=6.32
  const point=(x,z)=>[x,top-(top-shoulder)*Math.min(Math.abs(x),Math.abs(z))/h,z]
  for(const sx of [-1,1]) for(const sz of [-1,1]) {
    const p=[point(0,0),point(sx*h,0),point(sx*h,sz*h),point(0,sz*h)]
    // Split at the diagonal valley so the ridge intersection stays crisp.
    for(const triangle of [[p[0],p[1],p[2]],[p[0],p[2],p[3]]]) {
      const a=new T.Vector3(...triangle[1]).sub(new T.Vector3(...triangle[0]))
      const b=new T.Vector3(...triangle[2]).sub(new T.Vector3(...triangle[0]))
      polygon('tile',a.cross(b).y>0?triangle:triangle.reverse())
    }
    for(let c=1;c<=12;c++) {
      const d=h*c/12
      tube('tileLight',Array.from({length:5},(_,i)=>{const p=point(sx*d,sz*d*i/4);p[1]+=.021;return p}),.017,5,4)
      tube('tileLight',Array.from({length:5},(_,i)=>{const p=point(sx*d*i/4,sz*d);p[1]+=.021;return p}),.017,5,4)
    }
  }
  box('tileLight',0,7.095,0,2.32,.075,.075)
  box('tileLight',0,7.095,0,.075,.075,2.32)
})
for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]) inFrame(0,towerZ,angle,()=>{
  polygon(angle===0?'gold':'stone',[[-1.08,6.315,1.085],[1.08,6.315,1.085],[0,7.07,1.085]])
  for(let y=6.36;y<7.02;y+=.075) {
    const w=2.12*(7.07-y)/.755
    box('timber',0,y,1.096,w,.012,.015)
    for(let x=-w/2+.06;x<w/2;x+=.11) box('timber',x,y+.032,1.098,.011,.064,.014)
  }
  tube('tileLight',[[-1.16,6.29,1.11],[-.66,6.66,1.11],[0,7.13,1.11],[.66,6.66,1.11],[1.16,6.29,1.11]],.055,8,5)
  tube('tileDark',[[-1.04,6.31,1.13],[0,7.04,1.13],[1.04,6.31,1.13]],.021,2,4)
})
inFrame(0,towerZ,0,()=>{
  for(const x of [-.98,.98]) for(const z of [-.98,.98]) {
    box('tileDark',x,6.59,z,.105,.4,.105)
    box('tileLight',x,6.47,z,.17,.07,.17)
    ridgeOrnament(x,6.79,z,Math.sign(x))
  }
})
// The red star is visible in the official contemporary tower photograph.
const star=new T.Shape()
for(let i=0;i<10;i++) {
  const a=Math.PI/2+i*Math.PI/5,r=i%2===0?.32:.145
  const x=Math.cos(a)*r,y=Math.sin(a)*r
  i===0?star.moveTo(x,y):star.lineTo(x,y)
}
star.closePath()
add('red',new T.ExtrudeGeometry(star,{depth:.045,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,steps:1}).translate(0,6.62,towerZ+1.12))
cylinder('tileLight',0,7.19,towerZ,.056,.20)
add('tileLight',new T.SphereGeometry(.105,8,5).scale(.68,1.2,.68).translate(0,7.35,towerZ))

// Wall-hugging, seeded foliage. Openings stay readable; no spherical ivy blobs.
function ivy(width, height, z, masks, density, phase) {
  for(let i=0;i<density;i++) {
    const y=.3+random()*(height-.4)
    const center=Math.sin(y*2.1+phase)*width*.17 + Math.cos(y*3.2)*.07
    const x=center+(random()-.5)*width*.42
    if(masks.some(([a,b,w,h])=>Math.abs(x-a)<w/2+.05&&Math.abs(y-b)<h/2+.045)) continue
    const size=.032+random()*.055
    const color=new T.Color().setHSL(.205+random()*.05,.28+random()*.13,.29+random()*.14,T.SRGBColorSpace)
    const a=random()*Math.PI*2
    const points=[[0,size*1.2],[-size*.32,size*.4],[-size,size*.18],[-size*.58,-size*.46],[0,-size*.72],[size*.58,-size*.46],[size,size*.18],[size*.32,size*.4]]
    const outline=points.map(([px,py])=>[x+px*Math.cos(a)-py*Math.sin(a),y+px*Math.sin(a)+py*Math.cos(a),z+.019])
    for(let j=0;j<outline.length;j++) polygon('leaf',[[x,y,z+.045],outline[j],outline[(j+1)%outline.length]],color)
  }
}
for(const angle of [0,Math.PI/2,-Math.PI/2,Math.PI]) inFrame(0,towerZ,angle,()=>{
  const masks=[[0,.85,1.35,1.65],[0,1.8,1.6,.85],[0,3.09,.62,.8],[0,4.35,.65,.85],[0,5.3,1.6,.8]]
  for(const side of [-1,1]) {
    const old=frame
    frame=frame.clone().multiply(new T.Matrix4().makeTranslation(side*.81,0,0))
    ivy(.64,5.75,towerHalf+.079,masks.map(([x,y,w,h])=>[x-side*.81,y,w,h]),310,side*2)
    frame=old
  }
})
for(const angle of [0,Math.PI]) inFrame(0,0,angle,()=>{
  const masks=wingXs.flatMap(x=>[-x,x]).flatMap(x=>[.76,1.77].map(y=>[x,y,.43,.81]))
  for(const x of [-6.0,-4.25,-2.6,2.6,4.8,6.6]) {
    const old=frame
    frame=frame.clone().multiply(new T.Matrix4().makeTranslation(x,0,0))
    ivy(.85,2.17,2.37,masks.map(([a,y,w,h])=>[a-x,y,w,h]),125,x)
    frame=old
  }
})

let triangles=0
for(const [key,geometries] of Object.entries(buckets)) {
  if(!geometries.length) continue
  const geometry=mergeVertices(mergeGeometries(geometries,false),1e-5)
  const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({...definitions[key],name:key}))
  mesh.name=key
  mesh.castShadow=true
  mesh.receiveShadow=true
  root.add(mesh)
  triangles+=(geometry.index?.count??geometry.attributes.position.count)/3
}
root.updateMatrixWorld(true)
const bounds=new T.Box3().setFromObject(root)
await mkdir('src/scene/models',{recursive:true})
const output=await new GLTFExporter().parseAsync(root,{binary:true})
await writeFile('src/scene/models/north-building.glb',Buffer.from(output))
const metrics={triangles,drawCalls:root.children.length,bytes:output.byteLength,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}}
await writeFile('src/scene/models/north-building-metrics.json',JSON.stringify(metrics,null,2)+'\n')
// An optional portable geometry dump supports offline visual inspection.
if(process.argv.includes('--inspection')) {
  await mkdir('.work/model-review',{recursive:true})
  const dump=root.children.map(m=>({name:m.name,color:m.material.color.toArray(),positions:Array.from(m.geometry.attributes.position.array),normals:Array.from(m.geometry.attributes.normal.array),colors:m.geometry.attributes.color?Array.from(m.geometry.attributes.color.array):null,indices:Array.from(m.geometry.index.array)}))
  await writeFile('.work/model-review/geometry.json',JSON.stringify(dump))
}
console.log(JSON.stringify(metrics,null,2))
