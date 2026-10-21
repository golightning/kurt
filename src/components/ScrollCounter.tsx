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
  from = 0.45,
}: {
  to: number
  suffix?: string
  decimals?: number
  /** Ab welchem Anteil des Ankerfortschritts gezaehlt wird. Der Anker richtet
   *  sich nach der Zeichnung; die Zahlen stehen darunter und sind erst spaeter
   *  im Bild. Ohne Versatz war der Zaehler bei ihrem ersten Erscheinen schon
   *  ueber die Haelfte gelaufen (gemessen: 7,20 von 13,60 m bei 48 % sichtbar)
   *  und am Ziel, bevor die Zeichnung aus dem Bild war. */
  from?: number
}) {
  const shared = useContext(ProgressContext)
  const own = useScrollProgress<HTMLSpanElement>({ start: 1.0, end: 0.55 })
  const raw = shared ?? own.progress
  // Auf das Restfenster strecken: bei `from` startet die Zahl bei 0 und ist am
  // Ende des Ankers am Zielwert.
  // `span` statt bis 1 zu strecken: die Zahl soll ihr Ziel erreichen, solange
  // sie voll im Bild steht, nicht erst am Ende des Ankerfensters.
  const span = 0.3
  const progress =
    shared === null ? raw : Math.max(0, Math.min(1, (raw - from) / span))
  const value = (to * progress).toFixed(decimals).replace('.', ',')
  return (
    <span ref={shared === null ? own.ref : undefined} className="nums tabular-nums">
      {value}
      {suffix}
    </span>
  )
}
