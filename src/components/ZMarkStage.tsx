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

function StaticMark() {
  return (
    <div className="grid h-full w-full place-items-center" aria-hidden="true">
      <ZMark className="h-auto w-full max-w-sm opacity-95" />
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
    <div className={className}>
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
