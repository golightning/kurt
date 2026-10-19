import { Link } from 'react-router-dom'
import { ZMarkStage } from '@/components/ZMarkStage'
import { Counter, Picture, Reveal, Section, SectionHead } from '@/components/ui'
import { certifications, reach, services, stats, sustainability, values } from '@/data/site'

export function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <Reach />
      <Values />
      <Sustainability />
      <Certifications />
      <ClosingCta />
    </>
  )
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-20">
      {/* Red bloom behind the mark — the only large colour field on the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[55rem] w-[55rem] -translate-x-1/4 -translate-y-1/2 rounded-full opacity-[0.16] blur-[130px]"
        style={{ background: 'radial-gradient(circle, #e20613 0%, transparent 65%)' }}
      />

      <div className="shell relative grid min-h-[calc(100svh-5rem)] items-center gap-10 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <Reveal className="relative z-10 py-16">
          <p className="eyebrow reveal">Spedition in Ulm · seit über 30 Jahren</p>

          <h1 className="reveal mt-6 text-[clamp(2.1rem,6.2vw,5rem)] leading-[1.0] md:leading-[0.95]">
            Ganzheitliche
            <br />
            <span className="text-red">Logistik</span>lösungen
          </h1>

          <p className="reveal mt-8 max-w-xl text-lg leading-relaxed text-muted">
            Nationale und internationale Transporte von Ulm bis in die Türkei und nach Griechenland.
            Hängende Bekleidung, temperaturgeführte Ladung, Filialbelieferung ohne Rampe — mit einer
            festen Ansprechperson, die Ihren Auftrag kennt.
          </p>

          <div className="reveal mt-10 flex flex-wrap items-center gap-4">
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

          <p className="reveal mt-10 text-xs uppercase tracking-[0.2em] text-faint">
            ISO 9001 · ISO 27001 · IFS Progress Logistics
          </p>
        </Reveal>

        <ZMarkStage className="relative h-[42svh] w-full lg:h-[80svh]" />
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="border-y border-line bg-ink-2">
      <Reveal className="shell grid grid-cols-2 gap-px lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="reveal py-12 pr-6">
            <p className="font-display text-5xl font-extrabold leading-none text-fg md:text-6xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-3 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

function Services() {
  return (
    <Section id="leistungen">
      <SectionHead
        eyebrow="Branchenlösungen"
        title="Fracht, die nicht auf eine Standardpalette passt"
        lead="Fünf Transportarten, für die es jeweils eigenes Equipment und eigenes Wissen braucht — beides haben wir im Haus."
      />

      <Reveal className="mt-16 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article key={s.slug} className="reveal group relative bg-ink p-8 transition-colors duration-300 hover:bg-surface">
            <span className="font-display text-sm font-bold text-red/50 nums">
              {String(services.indexOf(s) + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-5 text-xl">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.teaser}</p>
            <ul className="mt-6 space-y-2">
              {s.facts.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs text-faint">
                  <span className="mt-[0.45rem] h-px w-3 shrink-0 bg-red" />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}

        <Link
          to="/leistungen"
          className="reveal group flex flex-col justify-between bg-surface p-8 transition-colors duration-300 hover:bg-surface-2"
        >
          <span className="eyebrow">Alle Details</span>
          <span className="mt-8 font-display text-2xl leading-tight">
            Leistungen
            <br />
            im Überblick
            <span className="ml-2 inline-block transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5">
              →
            </span>
          </span>
        </Link>
      </Reveal>
    </Section>
  )
}

function Reach() {
  return (
    <Section className="border-t border-line bg-ink-2">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionHead
            eyebrow="National & International"
            title="Von Ulm bis Istanbul und Thessaloniki"
          />
          <div className="mt-10 space-y-8">
            <div className="reveal border-l-2 border-red pl-6">
              <h3 className="text-lg">Nationale Verkehre</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{reach.national}</p>
            </div>
            <div className="reveal border-l-2 border-slate pl-6">
              <h3 className="text-lg">Internationale Verkehre</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{reach.international}</p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <Picture
            base="/img/Europa-Deutschland_1-2048x1525-1"
            alt="Karte der von KURT bedienten Relationen in Europa"
            className="reveal block overflow-hidden rounded-sm border border-line"
            imgClassName="w-full h-auto opacity-80 mix-blend-screen"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </Reveal>
      </div>
    </Section>
  )
}

function Values() {
  return (
    <Section>
      <SectionHead eyebrow="Arbeitsweise" title="Vier Dinge, auf die Sie sich verlassen können" />
      <Reveal className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.title} className="reveal">
            <div className="rule-red" />
            <h3 className="mt-6 text-lg">{v.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{v.body}</p>
          </div>
        ))}
      </Reveal>
    </Section>
  )
}

function Sustainability() {
  return (
    <Section className="border-y border-line bg-ink-2">
      <SectionHead
        eyebrow="Ressourcenschonende Logistik"
        title="Weniger Fahrten sind günstiger — und sauberer"
        lead="Effizienz und Emissionsreduktion fallen in der Logistik meistens zusammen. Diese sechs Maßnahmen setzen wir konkret um."
      />
      <Reveal className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {sustainability.map((s, i) => (
          <div key={s.title} className="reveal flex gap-5">
            <span className="font-display text-sm font-bold text-red/40 nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-base">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </Section>
  )
}

function Certifications() {
  return (
    <Section>
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionHead
            eyebrow="Zertifizierungen"
            title="Geprüft, nicht behauptet"
            lead="Drei laufend auditierte Systeme — das letzte ISO-9001-Audit haben wir im Mai 2025 bestanden."
          />
        </Reveal>
        <Reveal className="grid gap-px border border-line bg-line">
          {certifications.map((c) => (
            <div key={c.code} className="reveal bg-ink p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-lg">{c.code}</h3>
                <span className="text-xs text-faint nums">{c.full}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{c.note}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
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
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
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
