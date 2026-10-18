import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import {
  createKURTZBrandMarkModel,
  createKURTZBrandMarkEnvironment,
} from '@/three/createKurtZMarkModel'

/** The mark itself. The geometry comes from the generated factory, which extrudes the
 *  contours measured off the original logo raster — so this is the client's own mark in
 *  three dimensions, not a lookalike. */
function Mark({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null)
  const model = useMemo(() => {
    const m = createKURTZBrandMarkModel()
    // The factory centres on the red bounding box; the slate ribbon hangs below and to
    // the right, so recentre on the full lockup or the mark sits high in frame.
    const box = new THREE.Box3().setFromObject(m)
    const c = box.getCenter(new THREE.Vector3())
    m.position.set(-c.x, -c.y, -c.z)
    return m
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const p = pointer.current ?? { x: 0, y: 0 }
    // Slow idle drift plus a gentle parallax lean toward the cursor.
    const targetY = Math.sin(t * 0.22) * 0.38 + p.x * 0.42
    const targetX = Math.sin(t * 0.17) * 0.09 - p.y * 0.26
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3, delta)
  })

  return (
    <group ref={group} scale={0.98}>
      <primitive object={model} />
    </group>
  )
}

/** Khronos PBR Neutral instead of ACES. ACES is a film look and pushes a saturated
 *  primary red toward salmon — measured during the model review: the brand's #e20613
 *  rendered visibly orange until this was changed. Neutral preserves brand colour.
 *
 *  The environment is generated locally from three's RoomEnvironment. drei's
 *  `<Environment preset>` fetches an HDR from a CDN, which leaves the Suspense
 *  boundary pending forever behind a strict network and renders an empty canvas. */
function Stage() {
  const { gl, scene } = useThree()
  useEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping
    gl.toneMappingExposure = 0.62
    gl.outputColorSpace = THREE.SRGBColorSpace
    const env = createKURTZBrandMarkEnvironment(gl)
    scene.environment = env
    scene.environmentIntensity = 0.5
    return () => {
      scene.environment = null
      env.dispose()
    }
  }, [gl, scene])
  return null
}

export function ZMarkCanvas() {
  const pointer = useRef({ x: 0, y: 0 })

  return (
    <div
      className="h-full w-full"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        pointer.current = {
          x: ((e.clientX - r.left) / r.width - 0.5) * 2,
          y: ((e.clientY - r.top) / r.height - 0.5) * 2,
        }
      }}
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 }
      }}
    >
      <Canvas
        camera={{ position: [0, 0.05, 4.1], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        aria-hidden="true"
      >
        <Stage />
        <directionalLight position={[3, 4, 5]} intensity={2.1} />
        <directionalLight position={[-4, 1.5, -4]} intensity={2.3} color="#ff5a4a" />
        <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#8fb0ff" />
        <ambientLight intensity={0.08} />
        <Mark pointer={pointer} />
        <ContactShadows position={[0, -0.95, 0]} opacity={0.38} scale={5} blur={2.8} far={2.2} />
      </Canvas>
    </div>
  )
}
