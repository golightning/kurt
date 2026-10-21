import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useSharedProgress } from '@/components/ScrollCounter'

/** Der Auflieger im Riss, beim Scrollen bemasst.
 *
 *  Dieselbe Mechanik wie RouteLine — Scrollen ist ein Regler, kein Schalter. Hier
 *  baut sich eine technische Zeichnung auf: erst der Umriss, dann die Hoehen-, dann
 *  die Laengenbemassung, zuletzt die Haengestangen. Die Masse sind die echten aus
 *  dem Fuhrpark (13,60 m Textil-Koffersattel, 2,75 m Innenhoehe, 3-fach Haengung),
 *  nicht erfunden.
 *
 *  Wie bei RouteLine wird in PIXELN gerechnet und nicht in viewBox-Einheiten:
 *  getTotalLength() liefert Nutzereinheiten, waehrend strokeDasharray mit
 *  non-scaling-stroke im gerenderten Raum wirkt. Ein Koordinatensystem fuer alles.
 */

// Zeichenfläche in viewBox-Einheiten; das Seitenverhältnis entspricht grob dem
// Auflieger (13,60 m lang bei 2,75 m Innenhöhe plus Fahrwerk und Bemaßungsrand).
// Die viewBox muss die BEMASSUNG mit einschliessen, nicht nur den Aufbau: die
// Hoehenbemassung sitzt links davon, die Laengenbemassung darunter. Mit einem zu
// engen Rahmen lief "2,75 m" aus dem Bild.
const VB = { w: 1100, h: 470 }
const BODY = { x: 250, y: 96, w: 740, h: 185 }

/** Lineare Teilstrecke eines Gesamtfortschritts: Phase 2 von 4 usw. */
const phase = (p: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (p - from) / (to - from)))

export function TrailerScale() {
  // Teilt die Zeitachse mit den Kennzahlen darunter, wenn ein Anker vorhanden ist.
  const shared = useSharedProgress()
  const own = useScrollProgress<HTMLDivElement>({ start: 1.0, end: 0.5 })
  const progress = shared ?? own.progress
  const reduced = own.reduced
  const ref = shared === null ? own.ref : undefined

  // Frueh und mit Ueberlappung: der Umriss stand vorher erst, wenn die Zeichnung
  // schon ganz im Bild war — der Aufbau wirkte dadurch verspaetet. Jetzt ist der
  // Umriss bei einem Drittel des Wegs fertig, und die Bemassung setzt ein,
  // waehrend er noch laeuft.
  // Staerker ueberlappend: mit vier getrennten Phasen begannen die Haengestangen
  // erst, als die Zeichnung schon wieder aus dem Bild lief. Jetzt setzt jede
  // Phase ein, waehrend die vorige noch laeuft — der Aufbau ist bei ~75 % des
  // Wegs fertig, also solange die Zeichnung voll im Bild steht.
  const pOutline = phase(progress, 0.0, 0.2)
  const pHeight = phase(progress, 0.14, 0.34)
  const pLength = phase(progress, 0.26, 0.46)
  const pBars = phase(progress, 0.36, 0.7)

  const bars = 12
  const barsShown = reduced ? bars : Math.round(pBars * bars)

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="mx-auto h-auto w-full max-w-5xl"
        role="img"
        aria-label="Riss des Textil-Koffersattels: 13,60 Meter Ladelänge, 2,75 Meter Innenhöhe, Platz für eine 3-fach Hängung."
      >
        {/* Umriss: zeichnet sich als umlaufender Strich */}
        <rect
          x={BODY.x}
          y={BODY.y}
          width={BODY.w}
          height={BODY.h}
          fill="none"
          stroke="var(--color-slate)"
          strokeWidth="2"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - pOutline}
          vectorEffect="non-scaling-stroke"
        />

        {/* Fahrwerk und Königszapfen, nur angedeutet */}
        <g
          stroke="var(--color-slate)"
          strokeWidth="2"
          fill="none"
          opacity={pOutline}
          vectorEffect="non-scaling-stroke"
        >
          <circle cx={BODY.x + 610} cy={BODY.y + BODY.h + 26} r="24" />
          <circle cx={BODY.x + 676} cy={BODY.y + BODY.h + 26} r="24" />
          <path d={`M ${BODY.x + 60} ${BODY.y + BODY.h} v 26`} />
        </g>

        {/* Höhenbemaßung links: 2,75 m */}
        <g opacity={pHeight}>
          <path
            d={`M ${BODY.x - 54} ${BODY.y} V ${BODY.y + BODY.h}`}
            stroke="var(--color-red)"
            strokeWidth="1.5"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - pHeight}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M ${BODY.x - 64} ${BODY.y} h 20 M ${BODY.x - 64} ${BODY.y + BODY.h} h 20`}
            stroke="var(--color-red)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={BODY.x - 74}
            y={BODY.y + BODY.h / 2}
            fill="#ff4a3d"
            fontSize="30"
            fontWeight="600"
            textAnchor="end"
            dominantBaseline="middle"
          >
            2,75 m
          </text>
        </g>

        {/* Längenbemaßung unten: 13,60 m */}
        <g opacity={pLength}>
          <path
            d={`M ${BODY.x} ${BODY.y + BODY.h + 92} H ${BODY.x + BODY.w}`}
            stroke="var(--color-red)"
            strokeWidth="1.5"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - pLength}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M ${BODY.x} ${BODY.y + BODY.h + 82} v 20 M ${BODY.x + BODY.w} ${BODY.y + BODY.h + 82} v 20`}
            stroke="var(--color-red)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={BODY.x + BODY.w / 2}
            y={BODY.y + BODY.h + 132}
            fill="#ff4a3d"
            fontSize="30"
            fontWeight="600"
            textAnchor="middle"
          >
            13,60 m Ladelänge
          </text>
        </g>

        {/* Hängestangen: füllen sich von vorn nach hinten */}
        <g stroke="#f4f4f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
          {Array.from({ length: bars }, (_, i) => {
            const x = BODY.x + 34 + (i * (BODY.w - 68)) / (bars - 1)
            return (
              <path
                key={i}
                d={`M ${x} ${BODY.y + 24} V ${BODY.y + BODY.h - 24}`}
                opacity={i < barsShown ? 0.5 : 0}
                style={{ transition: 'opacity 260ms var(--ease-out-expo)' }}
              />
            )
          })}
        </g>

        {/* Zähler der Hängung, erscheint mit den Stangen */}
        <text
          x={BODY.x + BODY.w}
          y={BODY.y - 22}
          fill="#a3a3ae"
          fontSize="24"
          textAnchor="end"
          opacity={pBars}
        >
          3-fach Hängung kurzer Oberteile
        </text>
      </svg>
    </div>
  )
}
