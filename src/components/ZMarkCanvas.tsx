import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  createKURTZBrandMarkModel,
  createKURTZBrandMarkEnvironment,
} from '@/three/createKurtZMarkModel'

/** Die 3D-Marke, auf reinem three.js.
 *
 *  Vorher lief das ueber @react-three/fiber plus drei (ContactShadows,
 *  Environment). Auf dem iPhone blieb die Buehne dadurch leer oder zeigte nur
 *  kurz etwas: der Brocken aus three + fiber + drei liegt bei 239 KB gzip und
 *  muss ueber Mobilfunk vollstaendig da sein, bevor ueberhaupt ein Bild
 *  entsteht. Dazu kam ein weicher Schattenpass (ContactShadows) jedes Frame,
 *  den die Szene gar nicht braucht — sie steht frei auf dunklem Grund.
 *
 *  Das Gegenstueck im Schwesterprojekt (3D-Blitz) laeuft seit jeher auf purem
 *  three.js und funktioniert auf dem Telefon. Dieselbe Bauweise jetzt hier:
 *  ein Renderer, eine Kamera, eine Schleife, kein React im Frame.
 *
 *  Die Modellfabrik bleibt unveraendert — die Geometrie stammt weiterhin aus
 *  den gemessenen Konturen des Originallogos. */
export function ZMarkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    // Auf 2 deckeln: das iPhone meldet 3, was die Pixelzahl gegenueber 2 noch
    // einmal verdoppelt, ohne auf dieser Groesse sichtbar zu sein.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    // Khronos PBR Neutral statt ACES: ACES ist ein Filmlook und zieht ein
    // gesaettigtes Primaerrot Richtung Lachs — das Markenrot #e20613 wurde
    // sichtbar orange, bis das umgestellt war.
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 0.62
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const env = createKURTZBrandMarkEnvironment(renderer)
    scene.environment = env
    scene.environmentIntensity = 0.5

    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    key.position.set(3, 4, 5)
    const rim = new THREE.DirectionalLight(0xff5a4a, 2.3)
    rim.position.set(-4, 1.5, -4)
    const fill = new THREE.DirectionalLight(0x8fb0ff, 0.5)
    fill.position.set(-3, -1, 2)
    scene.add(key, rim, fill, new THREE.AmbientLight(0xffffff, 0.08))

    const model = createKURTZBrandMarkModel()
    // Die Fabrik zentriert auf die rote Bounding-Box; das graue Band haengt
    // darunter und rechts heraus. Ohne Neuzentrierung sitzt die Marke hoch.
    const box = new THREE.Box3().setFromObject(model)
    const c = box.getCenter(new THREE.Vector3())
    model.position.set(-c.x, -c.y, -c.z)
    const sz = box.getSize(new THREE.Vector3())
    const radius = Math.max(sz.x, sz.y) / 2

    const holder = new THREE.Group()
    holder.add(model)
    scene.add(holder)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    camera.position.set(0, 0.05, 4.1)

    const pointer = { x: 0, y: 0 }
    let scroll = 0
    const current = { rx: 0, ry: 0, z: 0 }
    let raf = 0
    let running = false
    const start = performance.now()

    /** Die Marke auf die Buehne einpassen statt fest zu skalieren.
     *  three.js haelt das vertikale Sichtfeld konstant: auf dem Telefon ist die
     *  Buehne nur 32svh hoch, der sichtbare Weltausschnitt schrumpft also mit,
     *  das Modell nicht. Gemessen wird, wie viel Welt hineinpasst. */
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      const halfW = halfH * camera.aspect
      // 0.86: etwas Luft, damit die Drehung nicht anschneidet.
      holder.scale.setScalar((Math.min(halfW, halfH) / radius) * 0.86)
    }

    const draw = () => {
      const t = (performance.now() - start) / 1000
      // Der Scrollanteil wird gedaempft (sqrt): linear drehte die Marke ueber
      // die Profilkante hinaus und zeigte danach wieder mehr Flaeche.
      const sEase = Math.sqrt(scroll)
      const tgY = reduced ? 0 : Math.sin(t * 0.22) * 0.38 + pointer.x * 0.42 + sEase * 1.5
      const tgX = reduced ? 0 : Math.sin(t * 0.17) * 0.09 - pointer.y * 0.26 + sEase * 0.32
      const tgZ = reduced ? 0 : -sEase * 1.9
      const k = reduced ? 1 : 0.08
      current.ry += (tgY - current.ry) * k
      current.rx += (tgX - current.rx) * k
      current.z += (tgZ - current.z) * k
      holder.rotation.set(current.rx, current.ry, 0)
      holder.position.z = current.z
      renderer.render(scene, camera)
    }

    const loop = () => {
      if (!running) return
      draw()
      raf = requestAnimationFrame(loop)
    }

    resize()
    draw()

    const onScroll = () => {
      scroll = Math.max(0, Math.min(1, window.scrollY / innerHeight))
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onResize = () => {
      resize()
      draw()
    }

    // Nur rechnen, solange die Buehne im Bild ist — sonst laeuft auf dem
    // Telefon eine Render-Schleife weiter, waehrend man die Seite liest.
    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting
      if (reduced) return
      if (visible && !running) {
        running = true
        raf = requestAnimationFrame(loop)
      } else if (!visible && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(canvas)

    if (!reduced) {
      addEventListener('scroll', onScroll, { passive: true })
      addEventListener('pointermove', onMove, { passive: true })
    }
    addEventListener('resize', onResize)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      removeEventListener('scroll', onScroll)
      removeEventListener('pointermove', onMove)
      removeEventListener('resize', onResize)
      scene.environment = null
      env.dispose()
      model.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else if (mat) (mat as THREE.Material).dispose()
      })
      renderer.dispose()
    }
  }, [])

  return <canvas ref={ref} className="block h-full w-full" aria-hidden="true" />
}
