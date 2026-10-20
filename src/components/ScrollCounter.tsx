import { createContext, useContext, type ReactNode } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/** Gemeinsamer Fortschritt fuer einen ganzen Abschnitt.
 *
 *  Warum nicht jeder Zaehler fuer sich: ein Element, das an seiner EIGENEN
 *  Position haengt, startet umso spaeter, je tiefer es im Abschnitt sitzt. Die
 *  Kennzahlen stehen rund 500 px unter der Zeichnung — sie standen dadurch noch
 *  auf 0,00 m, waehrend die Zeichnung schon fertig bemasst war. Mit einem Anker
 *  teilen Zeichnung und Zahlen eine Zeitachse.
 */
const ProgressContext = createContext<number | null>(null)

export function ScrollProgressAnchor({
  children,
  className = '',
  start = 0.95,
  end = 0.5,
}: {
  children: ReactNode
  className?: string
  start?: number
  end?: number
}) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>({ start, end })
  return (
    <div ref={ref} className={className}>
      <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>
    </div>
  )
}

/** Fortschritt des umgebenden Ankers, oder null wenn keiner da ist. */
export function useSharedProgress() {
  return useContext(ProgressContext)
}

/** Zahl, die am Scroll haengt statt an einem Timer.
 *
 *  Der `Counter` in ui.tsx laeuft nach dem Einblenden einmal per rAF durch und ist
 *  danach vom Scrollen entkoppelt. Dieser folgt der Position: zurueckscrollen
 *  zaehlt zurueck. Innerhalb eines `ScrollProgressAnchor` nutzt er dessen
 *  Fortschritt, sonst seinen eigenen.
 */
export function ScrollCounter({
  to,
  suffix = '',
  decimals = 0,
}: {
  to: number
  suffix?: string
  decimals?: number
}) {
  const shared = useContext(ProgressContext)
  const own = useScrollProgress<HTMLSpanElement>({ start: 1.0, end: 0.55 })
  const progress = shared ?? own.progress
  const value = (to * progress).toFixed(decimals).replace('.', ',')
  return (
    <span ref={shared === null ? own.ref : undefined} className="nums tabular-nums">
      {value}
      {suffix}
    </span>
  )
}
