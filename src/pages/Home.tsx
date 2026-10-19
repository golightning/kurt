import { Link } from 'react-router-dom'
import { ZMarkStage } from '@/components/ZMarkStage'
import { ZMark } from '@/components/ZMark'
import { RouteLine } from '@/components/RouteLine'
import { Picture, Reveal, Section } from '@/components/ui'
import { certifications, reach, services, sustainability, values } from '@/data/site'

export function Home() {
  return (
    <>
      <Hero />
      <Leistungen />
      <Relation />
      <Arbeitsweise />
      <Ressourcen />
      <Zertifikate />
      <ClosingCta />
    </>
  )
}

/** Die Marke als Bauelement: überlebensgroß, angeschnitten, so leise, dass sie
 *  Grund ist und kein Bild. Vorher hatte das Z nur im Hero eine Rolle und war
 *  danach für den Rest der Seite verschwunden. */
function MarkGround({ side = 'right' }: { side?: 'left' | 'right' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 select-none ${
        side === 'right' ? 'right-[-14%]' : 'left-[-16%]'
      }`}
    >
      <ZMark className="h-[clamp(26rem,52vw,46rem)] w-auto opacity-[0.055]" />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-20">
      {/* Roter Schein hinter der Marke — die einzige grosse Farbflaeche der Seite. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[55rem] w-[55rem] -translate-x-1/4 -translate-y-1/2 rounded-full opacity-[0.16] blur-[130px]"
        style={{ background: 'radial-gradient(circle, #e20613 0%, transparent 65%)' }}
      />

      <div className="shell relative grid min-h-[calc(100svh-5rem)] items-center gap-10 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <div className="relative z-10 py-16">
          <h1 className="text-[clamp(2.1rem,6.2vw,5rem)] leading-[1.0] md:leading-[0.95]">
            Ganzheitliche
            <br />
            <span className="text-red">Logistik</span>lösungen
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            Spedition aus Ulm, seit über 30 Jahren. Nationale und internationale Transporte bis in
            die Türkei und nach Griechenland — hängende Bekleidung, temperaturgeführte Ladung,
            Filialbelieferung ohne Rampe.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/angebot"
              className="rounded-sm bg-red px-7 py-3.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98]"
            >
              Angebot in 2 Minuten
            </Link>
            <Link
              to="/leistungen"
              className="rounded-sm border border-line px-7 py-3.5 text-sm font-semibold text-fg transition-colors duration-200 hover:border-red hover:text-red"
            >
              Leistungen ansehen
            </Link>
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-faint">
            ISO 9001 · ISO 27001 · IFS Progress Logistics
          </p>
        </div>

        <ZMarkStage className="relative h-[42svh] w-full lg:h-[80svh]" />
      </div>
    </section>
  )
}

/** Gipfel 1 — die Karten sind weg. Jede Leistung ist eine Zeile in Displaygroesse;
 *  die Liste traegt die Sektion, nicht sechs gleich grosse Kacheln. */
function Leistungen() {
  return (
    <section className="relative overflow-hidden border-t border-line py-28 md:py-36">
      <MarkGround side="right" />
      <div className="shell relative">
        <h2 className="max-w-[16ch] text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">
          Fracht, die nicht auf eine Standardpalette passt
        </h2>

        <ul className="mt-16 border-t border-line">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                to="/leistungen"
                className="group grid items-baseline gap-x-10 gap-y-3 border-b border-line py-9 transition-colors duration-300 hover:bg-surface/50 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:py-11"
              >
                <h3 className="text-[clamp(1.5rem,3.6vw,2.6rem)] leading-[1.06] transition-colors duration-300 group-hover:text-red">
                  {s.title}
                  <span className="ml-3 inline-block text-red opacity-0 transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </h3>
                <div>
                  <p className="text-base leading-relaxed text-muted">{s.teaser}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-faint">
                    {s.facts.join(' · ')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Gipfel 2 — dunkler als alles andere, mit der einen autorisierten Bewegung der
 *  Seite. Ersetzt den frueheren Europa-Abschnitt samt Kartenbild. */
function Relation() {
  return (
    <section className="relative overflow-hidden bg-ink-2 py-28 md:py-36">
      <div className="shell relative">
        <h2 className="max-w-[18ch] text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">
          Von Ulm bis Istanbul und Thessaloniki
        </h2>

        <div className="mt-20 md:mt-24">
          <RouteLine />
        </div>

        <div className="mt-24 grid gap-12 border-t border-line pt-12 md:grid-cols-2 md:gap-20">
          <div>
            <h3 className="text-xl">Nationale Verkehre</h3>
            <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-muted">
              {reach.national}
            </p>
          </div>
          <div>
            <h3 className="text-xl">Internationale Verkehre</h3>
            <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-muted">
              {reach.international}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Bewusst leise: die Taeler zwischen den Gipfeln ---------- */

function QuietSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Section className="border-t border-line">
      <div className="grid gap-x-16 gap-y-10 md:grid-cols-[minmax(0,14rem)_1fr]">
        <h2 className="text-xl leading-snug text-muted">{label}</h2>
        {children}
      </div>
    </Section>
  )
}

function Arbeitsweise() {
  return (
    <QuietSection label="Worauf Sie sich verlassen können">
      <dl className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title}>
            <dt className="text-base text-fg">{v.title}</dt>
            <dd className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">{v.body}</dd>
          </div>
        ))}
      </dl>
    </QuietSection>
  )
}

function Ressourcen() {
  return (
    <QuietSection label="Ressourcenschonende Logistik">
      <ul className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
        {sustainability.map((s) => (
          <li key={s.title} className="max-w-[62ch]">
            <span className="text-base text-fg">{s.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{s.body}</span>
          </li>
        ))}
      </ul>
    </QuietSection>
  )
}

function Zertifikate() {
  return (
    <QuietSection label="Geprüft, nicht behauptet">
      <dl className="grid gap-x-12 gap-y-7 sm:grid-cols-3">
        {certifications.map((c) => (
          <div key={c.code}>
            <dt className="text-base text-fg">{c.code}</dt>
            <dd className="mt-1 text-xs text-faint nums">{c.full}</dd>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{c.note}</dd>
          </div>
        ))}
      </dl>
    </QuietSection>
  )
}

function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <Picture
        base="/img/LKW-auf-Bruecke-2-1"
        alt=""
        className="absolute inset-0 block"
        imgClassName="h-full w-full object-cover opacity-20"
        sizes="100vw"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40"
      />
      <Reveal className="shell relative py-28 md:py-36">
        <h2 className="reveal max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
          Sagen Sie uns, was wohin soll. Den Rest klären wir.
        </h2>
        <p className="reveal mt-6 max-w-xl text-lg text-muted">
          Ladestelle, Entladestelle, Gewicht und Maße genügen für ein Angebot. Werktags antworten wir
          innerhalb von 24 Stunden.
        </p>
        <div className="reveal mt-10">
          <Link
            to="/angebot"
            className="inline-block rounded-sm bg-red px-8 py-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98]"
          >
            Unverbindliches Angebot anfordern
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
