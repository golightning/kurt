import { Suspense, lazy, useEffect, useState } from 'react'
import { ZMark } from '@/components/ZMark'

/** three.js plus the fiber/drei wrappers are ~245 KB gzipped — a quarter of a megabyte
 *  that only the hero on one route needs. A static import would put it in the critical
 *  path of every page load, so it is pulled in lazily, after the page has painted and
 *  only once we know the device will actually use it. Until then (and forever, on a
 *  reduced-motion or no-WebGL device) the vector mark stands in. */
const ZMarkCanvas = lazy(() =>
  import('@/components/ZMarkCanvas').then((m) => ({ default: m.ZMarkCanvas })),
)

/** Der Vektor-Ersatz muss in die HOEHE der Buehne passen, nicht in ihre Breite.
 *  Mit `h-auto w-full` ergab sich die Hoehe aus der Breite: bei 440 px Viewport
 *  und dem nahezu quadratischen viewBox-Verhaeltnis (1212x1168) wurde das SVG
 *  rund 390 px hoch, waehrend die Buehne nur 32svh (~306 px) hoch ist. Es lief
 *  oben und unten heraus und lag ueber Text und Canvas. */
function StaticMark() {
  return (
    <div className="grid h-full w-full place-items-center overflow-hidden" aria-hidden="true">
      <ZMark className="h-full max-h-full w-auto max-w-full opacity-95" />
    </div>
  )
}

export function ZMarkStage({ className = '' }: { className?: string }) {
  const [wanted, setWanted] = useState(false)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ok = false
    try {
      ok = !!document.createElement('canvas').getContext('webgl2')
    } catch {
      ok = false
    }
    if (!ok) return

    // Wait for an idle moment so the 3D payload never competes with first paint.
    // requestIdleCallback is still missing on Safari, hence the timeout fallback.
    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
      cancelIdleCallback?: (h: number) => void
    }).requestIdleCallback

    const handle = ric
      ? ric(() => setWanted(true), { timeout: 1200 })
      : window.setTimeout(() => setWanted(true), 400)

    return () => {
      const cic = (window as Window & { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback
      if (ric !== undefined && cic !== undefined) cic(handle)
      else clearTimeout(handle)
    }
  }, [])

  return (
    <div className={`${className} overflow-hidden`}>
      {wanted ? (
        <Suspense fallback={<StaticMark />}>
          <ZMarkCanvas />
        </Suspense>
      ) : (
        <StaticMark />
      )}
    </div>
  )
}
