import type { ReactNode } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/** Liste, die sich am Scroll aufbaut statt einmal einzublenden.
 *
 *  Der Unterschied zu `Reveal`: dort faden alle Kinder mit festem Stagger ein,
 *  sobald der Block ins Bild kommt — danach ist die Animation fertig und vom
 *  Scrollen entkoppelt. Hier bestimmt die Scrollposition, wie weit die Liste
 *  aufgebaut ist; jede Zeile hat ihr eigenes Fenster im Fortschritt und laeuft
 *  beim Zurueckscrollen zurueck.
 *
 *  Die Zeile vor der aktiven bleibt sichtbar, die kommenden sind gedimmt statt
 *  unsichtbar: der Block ist auch bei halbem Fortschritt lesbar, und ohne JS oder
 *  bei reduzierter Bewegung steht alles auf 1.
 */
export function StackReveal({
  children,
  className = '',
}: {
  children: ReactNode[]
  className?: string
}) {
  const { ref, progress, reduced } = useScrollProgress<HTMLDivElement>({ start: 0.88, end: 0.4 })
  const n = children.length

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => {
        // Fenster pro Zeile, mit Ueberlappung: die Liste baut sich fliessend auf,
        // nicht in harten Stufen.
        const at = n > 1 ? i / (n - 1) : 0
        const local = Math.max(0, Math.min(1, (progress - at * 0.62) / 0.3))
        const t = reduced ? 1 : local
        return (
          <div
            key={i}
            style={{
              opacity: 0.18 + t * 0.82,
              transform: `translateY(${(1 - t) * 14}px)`,
              willChange: t > 0 && t < 1 ? 'opacity, transform' : undefined,
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}
