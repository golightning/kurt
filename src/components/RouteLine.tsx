import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** Schematische Relation — bewusst kein Kartenausschnitt.
 *
 *  Die eine autorisierte Bewegung der Seite: die Linie zeichnet sich beim Scrollen
 *  von Ulm nach Osten. Alle anderen Abschnitte bekommen deshalb keinen eigenen
 *  Auftritt; der Qualitätsboden verbietet denselben Eingang auf jedem Abschnitt.
 *
 *  Der Pfad wird in PIXELN gerechnet, nicht in viewBox-Einheiten. Mit einer
 *  gestreckten viewBox liefert getTotalLength() Nutzereinheiten, während
 *  strokeDasharray im gerenderten Raum wirkt — die Linie zerfiel dadurch in
 *  gleich lange Fragmente. Ein Koordinatensystem für Pfad, Strich und Beschriftung.
 */

type Stop = { x: number; y: number; name: string; note?: string; above?: boolean }

// Relative Lage entlang der Relation in Prozent, nicht geografisch massstabsgetreu.
const STOPS: Stop[] = [
  { x: 3, y: 46, name: 'Ulm', note: 'Hörvelsingerweg 52/2' },
  { x: 22, y: 38, name: 'München' },
  { x: 41, y: 33, name: 'Wien' },
  { x: 59, y: 39, name: 'Budapest' },
  // Hier faellt die Linie steil ab; die Beschriftung wuerde sie sonst kreuzen.
  { x: 75, y: 52, name: 'Belgrad', above: true },
  { x: 94, y: 64, name: 'Istanbul', note: 'Türkei' },
]

const BRANCH: Stop[] = [
  { x: 75, y: 52, name: '' },
  { x: 80, y: 74, name: '' },
  { x: 86, y: 88, name: 'Thessaloniki', note: 'Griechenland' },
]

/** Glatte Kurve durch die Haltepunkte, in Pixeln. */
const toPath = (stops: Stop[], w: number, h: number) =>
  stops
    .map((s, i) => {
      const X = (s.x / 100) * w
      const Y = (s.y / 100) * h
      if (i === 0) return `M ${X.toFixed(1)} ${Y.toFixed(1)}`
      const p = stops[i - 1]
      const PX = (p.x / 100) * w
      const PY = (p.y / 100) * h
      const cx = (PX + X) / 2
      return `C ${cx.toFixed(1)} ${PY.toFixed(1)}, ${cx.toFixed(1)} ${Y.toFixed(1)}, ${X.toFixed(1)} ${Y.toFixed(1)}`
    })
    .join(' ')

export function RouteLine() {
  const host = useRef<HTMLDivElement>(null)
  const main = useRef<SVGPathElement>(null)
  const branch = useRef<SVGPathElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [progress, setProgress] = useState(0)
  const [reduced, setReduced] = useState(false)

  useLayoutEffect(() => {
    const el = host.current
    if (!el) return
    // Direkt messen: ein ResizeObserver allein reicht nicht, weil sein erster
    // Callback unter StrictMode vom Cleanup des doppelt laufenden Effekts
    // verworfen werden kann und danach keine Groessenaenderung mehr folgt.
    const measure = () => {
      const r = el.getBoundingClientRect()
      setBox((prev) => {
        const w = Math.round(r.width)
        const h = Math.round(r.height)
        return prev.w === w && prev.h === h ? prev : { w, h }
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setProgress(1)
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const el = host.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const span = r.height * 0.8
      setProgress(Math.max(0, Math.min(1, (innerHeight * 0.8 - r.top) / span)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Pfadlänge und Strichversatz teilen sich jetzt denselben Pixelraum.
  useEffect(() => {
    if (!box.w) return
    for (const ref of [main, branch]) {
      const el = ref.current
      if (!el) continue
      const len = el.getTotalLength()
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len * (1 - progress)}`
    }
  }, [progress, box])

  const reached = (x: number) => reduced || progress * 100 >= x - 3

  return (
    <div ref={host} className="relative h-[clamp(19rem,40vw,30rem)] w-full">
      {box.w > 0 ? (
        <svg
          viewBox={`0 0 ${box.w} ${box.h}`}
          width={box.w}
          height={box.h}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <path
            ref={branch}
            d={toPath(BRANCH, box.w, box.h)}
            fill="none"
            stroke="var(--color-slate)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            ref={main}
            d={toPath(STOPS, box.w, box.h)}
            fill="none"
            stroke="var(--color-red)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      <p className="sr-only">
        Relation: Ulm, München, Wien, Budapest, Belgrad, Istanbul — mit Abzweig nach Thessaloniki.
      </p>

      <div className="pointer-events-none absolute inset-0">
        {[...STOPS, BRANCH[2]].map((s) => (
          <span
            key={s.name}
            className={`absolute transition-opacity duration-500 ease-[var(--ease-out-expo)] ${s.above ? "" : "-translate-x-1/2"}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: s.above ? 'translate(-50%, -100%)' : undefined,
              opacity: reached(s.x) ? 1 : 0.2,
            }}
          >
            {/* nur der Punkt sitzt auf der Koordinate, die Beschriftung haengt darunter */}
            {s.above ? (
              <span className="mb-2.5 block whitespace-nowrap text-center text-sm font-semibold text-fg">
                {s.name}
              </span>
            ) : null}
            <span className="mx-auto block h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-fg ring-4 ring-ink-2" />
            {!s.above ? (
              <>
                <span className="mt-2.5 block whitespace-nowrap text-center text-sm font-semibold text-fg">
                  {s.name}
                </span>
                {s.note ? (
                  <span className="mt-0.5 block whitespace-nowrap text-center text-xs text-muted">
                    {s.note}
                  </span>
                ) : null}
              </>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  )
}
