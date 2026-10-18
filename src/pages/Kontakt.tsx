import { Link } from 'react-router-dom'
import { PageHero } from '@/components/PageHero'
import { Reveal, Section } from '@/components/ui'
import { certifications, company } from '@/data/site'

export function Kontakt() {
  const mapsQuery = encodeURIComponent(
    `${company.name}, ${company.street}, ${company.zip} ${company.city}`,
  )

  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Eine Nummer, eine Ansprechperson"
        lead="Keine Warteschleife, kein Ticketsystem. Werktags von 7:00 bis 17:00 Uhr erreichen Sie jemanden, der Ihren Auftrag kennt."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <dl className="reveal divide-y divide-line border-y border-line">
              <Row label="Telefon">
                <a href={`tel:${company.phoneHref}`} className="font-display text-2xl font-extrabold transition-colors hover:text-red nums">
                  {company.phone}
                </a>
              </Row>
              <Row label="E-Mail">
                <a href={`mailto:${company.email}`} className="text-lg transition-colors hover:text-red">
                  {company.email}
                </a>
              </Row>
              <Row label="Telefax">
                <span className="text-lg text-muted nums">{company.fax}</span>
              </Row>
              <Row label="Öffnungszeiten">
                <span className="text-lg text-muted">{company.hours}</span>
              </Row>
              <Row label="Anschrift">
                <address className="not-italic text-lg leading-relaxed text-muted">
                  {company.name}
                  <br />
                  {company.street}
                  <br />
                  {company.zip} {company.city}
                </address>
              </Row>
              <Row label="Geschäftsführung">
                <span className="text-lg text-muted">{company.ceo}</span>
              </Row>
            </dl>

            <a
              href={`https://www.openstreetmap.org/search?query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal mt-8 inline-flex items-center gap-2 text-sm font-semibold text-red transition-opacity hover:opacity-80"
            >
              Route auf der Karte öffnen
              <span aria-hidden="true">→</span>
            </a>
          </Reveal>

          <Reveal>
            <div className="reveal rounded-sm border border-line bg-ink-2 p-8">
              <h2 className="text-xl">Transportanfrage</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Für ein Angebot brauchen wir Ladestelle, Entladestelle, Gewicht und die Art der
                Ladung. Das Formular führt Sie in drei Schritten durch.
              </p>
              <Link
                to="/angebot"
                className="mt-7 inline-block rounded-sm bg-red px-7 py-3.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98]"
              >
                Angebot anfordern
              </Link>
            </div>

            <div className="reveal mt-8 rounded-sm border border-line p-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-faint">
                Zertifizierungen
              </h2>
              <ul className="mt-5 space-y-4">
                {certifications.map((c) => (
                  <li key={c.code}>
                    <p className="text-base text-fg">{c.code}</p>
                    <p className="mt-1 text-xs text-faint nums">{c.full}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint sm:pt-1.5">
        {label}
      </dt>
      <dd className="text-fg">{children}</dd>
    </div>
  )
}
