import { Link } from 'react-router-dom'
import { PageHero } from '@/components/PageHero'
import { Reveal, Section } from '@/components/ui'
import { nav } from '@/data/site'

/** Unbekannte Pfade zeigten bisher die Startseite. Das verschleiert Tippfehler
 *  und tote Links: der Besucher sieht eine funktionierende Seite und merkt
 *  nicht, dass er woanders gelandet ist. */
export function NichtGefunden() {
  return (
    <>
      <PageHero
        eyebrow="Seite nicht gefunden"
        title="Diese Adresse führt ins Leere"
        lead="Der Link ist vermutlich veraltet oder enthält einen Tippfehler. Hier geht es weiter:"
      />
      <Section>
        <Reveal>
          <ul className="reveal grid gap-px border border-line bg-line sm:grid-cols-2">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block bg-ink p-7 transition-colors duration-300 hover:bg-surface"
                >
                  <span className="text-lg text-fg">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="reveal mt-10">
            <Link
              to="/angebot"
              className="inline-block rounded-sm bg-red px-8 py-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98]"
            >
              Angebot anfordern
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
