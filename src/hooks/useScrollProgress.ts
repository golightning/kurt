import { useEffect, useRef, useState } from 'react'

/** Fortschritt 0..1, waehrend ein Element durchs Fenster laeuft.
 *
 *  Der Unterschied zu `Reveal`: dort ist Scrollen ein Schalter (Element sichtbar →
 *  einmal einblenden). Hier ist Scrollen ein Regler — der Wert folgt der Position
 *  stufenlos und laeuft beim Zurueckscrollen zurueck. Das ist die Mechanik des
 *  Relation-Abschnitts, die hier nur noch herausgezogen wird, damit sie sich nicht
 *  in jeder Komponente wiederholt.
 *
 *  `start`/`end` sind Bruchteile der Fensterhoehe: Bei 0.85 beginnt es, wenn die
 *  Oberkante 85 % der Fensterhoehe erreicht hat, bei 0.25 ist es durch. Dazwischen
 *  wird linear interpoliert.
 *
 *  Bei `prefers-reduced-motion` liefert der Hook sofort 1 und haengt sich nie an
 *  den Scroll: der Endzustand ist dann der einzige Zustand, nichts geht verloren.
 */
export function useScrollProgress<T extends HTMLElement>(
  { start = 0.85, end = 0.3 }: { start?: number; end?: number } = {},
) {
  const ref = useRef<T>(null)
  // Startwert 1, nicht 0: dieser Wert landet im prerenderten HTML. Mit 0 standen
  // die Kennzahlen dort auf "0,00 m" und 14 Zeilen auf Opazitaet 0,18 — ohne
  // JavaScript blieb das der Endzustand. Der Effekt setzt sofort auf 0 zurueck,
  // bevor etwas sichtbar wird; laeuft kein JavaScript, bleibt der volle Zustand.
  const [progress, setProgress] = useState(1)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setProgress(1)
      return
    }
    setProgress(0)

    // rAF-gebuendelt: das Scroll-Event feuert oefter als der Browser zeichnet.
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const from = innerHeight * start
      const to = innerHeight * end
      const span = r.height + (from - to)
      if (span <= 0) return
      const p = (from - r.top) / span
      setProgress(Math.max(0, Math.min(1, p)))
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
  }, [start, end])

  return { ref, progress, reduced }
}
