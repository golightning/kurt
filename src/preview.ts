import * as THREE from 'three'
import {
  createKURTZBrandMarkModel,
  createKURTZBrandMarkLookDevLights,
  createKURTZBrandMarkEnvironment,
  frameKURTZBrandMarkCamera,
  configureKURTZBrandMarkRenderer,
} from './three/createKurtZMarkModel'

const params = new URLSearchParams(location.search)
const az = Number(params.get('az') ?? '0')
const mode = (params.get('mode') ?? 'neutral') as 'neutral' | 'grazing' | 'reference'
;(document.getElementById('az') as HTMLElement).textContent = `${az}  mode: ${mode}`

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
configureKURTZBrandMarkRenderer(renderer)
renderer.toneMappingExposure = Number(params.get('exp') ?? '1.0')
const tm = params.get('tm') ?? 'neutral'
renderer.toneMapping = tm === 'aces' ? THREE.ACESFilmicToneMapping
  : tm === 'none' ? THREE.NoToneMapping
  : THREE.NeutralToneMapping
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color('#0a0a0c')
scene.environment = createKURTZBrandMarkEnvironment(renderer)

const model = createKURTZBrandMarkModel()
scene.add(model)
if (params.get('rig') === 'custom') {
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key)
  const rim = new THREE.DirectionalLight(0xff5a4a, 2.4); rim.position.set(-4, 1.5, -4); scene.add(rim)
  const fill = new THREE.DirectionalLight(0x8fb0ff, 0.5); fill.position.set(-3, -1, 2); scene.add(fill)
  scene.add(new THREE.AmbientLight(0xffffff, 0.08))
} else {
  scene.add(createKURTZBrandMarkLookDevLights(mode))
}

const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100)
frameKURTZBrandMarkCamera(camera, model, { azimuthDeg: az, elevationDeg: 8, margin: 1.2 })

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  frameKURTZBrandMarkCamera(camera, model, { azimuthDeg: az, elevationDeg: 8, margin: 1.2 })
})

if (params.get('unlit') === '1') {
  // Unlit, map-stripped blockout evidence: base colour only, no lights, no environment,
  // no tone mapping — so the gate reads geometry, not look-dev.
  scene.environment = null
  renderer.toneMapping = THREE.NoToneMapping
  model.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const src = mesh.material as THREE.MeshPhysicalMaterial
    mesh.material = new THREE.MeshBasicMaterial({ color: src.color.clone() })
  })
}

const box = new THREE.Box3().setFromObject(model)
;(window as unknown as Record<string, unknown>).__diag = {
  empty: box.isEmpty(),
  min: box.min.toArray(), max: box.max.toArray(),
  meshes: (() => { let n = 0; model.traverse(o => { if ((o as THREE.Mesh).isMesh) n++ }); return n })(),
}

renderer.setAnimationLoop(() => renderer.render(scene, camera))
