import { Link } from 'react-router-dom'
import { PageHero } from '@/components/PageHero'
import { Picture, Reveal, Section } from '@/components/ui'
import { fleet } from '@/data/site'

export function Fuhrpark() {
  return (
    <>
      <PageHero
        eyebrow="Fuhrpark"
        title="Eine Lösung für jede Ladung"
        lead="Sechs Fahrzeugtypen, gewartet und geprüft vom eigenen Fuhrparkteam in Ulm. Kein Subunternehmer-Roulette."
      />

      <Section>
        <Reveal className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {fleet.map((v) => (
            <article key={v.title} className="reveal bg-ink p-8 transition-colors duration-300 hover:bg-surface">
              <h2 className="text-lg leading-snug">{v.title}</h2>
              <p className="mt-2 inline-block rounded-sm border border-line px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-red">
                {v.spec}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted">{v.use}</p>
            </article>
          ))}
        </Reveal>
      </Section>

      <Section className="border-y border-line bg-ink-2">
        <Reveal className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow reveal">Instandhaltung</p>
            <h2 className="reveal mt-4 text-3xl leading-tight md:text-4xl">
              Wartung im eigenen Haus, nicht nach Bedarf
            </h2>
            <p className="reveal mt-6 text-lg leading-relaxed text-muted">
              Unser internes Fuhrparkteam gewährleistet den reibungslosen Ablauf und die volle
              Funktionsfähigkeit der Fahrzeuge. Sie werden regelmäßig gewartet und geprüft, um
              höchste Sicherheitsstandards sicherzustellen. Erfahrene und geschulte Fahrer sorgen
              dafür, dass die Ladung so ankommt, wie sie losgefahren ist.
            </p>
          </div>
          <Picture
            base="/img/kurttransport-1-1"
            alt="Fahrzeuge der KURT-Flotte auf dem Betriebshof"
            className="reveal block overflow-hidden rounded-sm border border-line"
            imgClassName="w-full h-auto aspect-[4/3] object-cover"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <h2 className="reveal max-w-2xl text-3xl leading-tight md:text-4xl">
            Unsicher, welcher Fahrzeugtyp zu Ihrer Ladung passt?
          </h2>
          <p className="reveal mt-5 max-w-xl text-muted">
            Schildern Sie uns Maße und Gewicht — wir ordnen das zu.
          </p>
          <div className="reveal mt-9">
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
