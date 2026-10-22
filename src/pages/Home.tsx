import { Link } from 'react-router-dom'
import { ZMarkStage } from '@/components/ZMarkStage'
import { ZMark } from '@/components/ZMark'
import { RouteLine } from '@/components/RouteLine'
import { TrailerScale } from '@/components/TrailerScale'
import { StackReveal } from '@/components/StackReveal'
import { ScrollCounter, ScrollProgressAnchor } from '@/components/ScrollCounter'
import { asset, Picture, Reveal, Section } from '@/components/ui'
import {
  certifications,
  isCurrentlyCertified,
  partnership,
  reach,
  services,
  sustainability,
  values,
} from '@/data/site'

export function Home() {
  return (
    <>
      <Hero />
      <Leistungen />
      <Relation />
      <Masse />
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
            ISO 9001 · IFS Progress Logistics · Businesspartner SSV Ulm 1846
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

/** Gipfel 3 — der Auflieger im Riss, beim Scrollen bemasst. Beantwortet die
 *  Frage, die jeder Interessent zuerst stellt (passt meine Ladung rein?), mit
 *  einer Zeichnung statt mit einem Stockfoto. Die Masse stammen aus dem Fuhrpark. */
function Masse() {
  return (
    <section className="relative overflow-hidden border-t border-line py-28 md:py-36">
      <div className="shell relative">
        <div className="grid gap-x-16 gap-y-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <h2 className="max-w-[20ch] text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">
            Platz, der sich nachrechnen lässt
          </h2>
          <p className="max-w-[52ch] text-base leading-relaxed text-muted">
            Der Textil-Koffersattel nach XL-CODE: volle Ladelänge, 2,75 m lichte Höhe. Genug für
            eine 3-fach Hängung kurzer Oberteile oder eine 2-fach Hängung langer Bekleidung.
          </p>
        </div>

        {/* Ein Anker fuer Zeichnung UND Kennzahlen: beide haengen am Fortschritt des
            Abschnitts, nicht an ihrer je eigenen Position — sonst zaehlen die Zahlen
            erst los, wenn die Bemassung oben schon fertig ist. */}
        <ScrollProgressAnchor className="mt-12 md:mt-16" start={0.92} end={0.12}>
          <TrailerScale />

          <dl className="mt-10 grid gap-x-12 gap-y-8 border-t border-line pt-10 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Ladelänge</dt>
            <dd className="mt-1 text-[clamp(1.6rem,3.2vw,2.4rem)] leading-none text-fg">
              <ScrollCounter to={13.6} decimals={2} suffix=" m" from={0.3} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Lichte Innenhöhe</dt>
            <dd className="mt-1 text-[clamp(1.6rem,3.2vw,2.4rem)] leading-none text-fg">
              <ScrollCounter to={2.75} decimals={2} suffix=" m" from={0.3} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Fahrzeugtypen im Haus</dt>
            <dd className="mt-1 text-[clamp(1.6rem,3.2vw,2.4rem)] leading-none text-fg">
              <ScrollCounter to={6} from={0.3} />
            </dd>
          </div>
          </dl>
        </ScrollProgressAnchor>
      </div>
    </section>
  )
}

/** Vier Zusagen, die sich beim Scrollen aufbauen. Vorher eine zweispaltige
 *  Definitionsliste ohne jede Bewegung — vom Nutzer als langweilig markiert. */
function Arbeitsweise() {
  return (
    <Section className="border-t border-line">
      <h2 className="max-w-[20ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.05]">
        Worauf Sie sich verlassen können
      </h2>
      <StackReveal className="mt-14 border-t border-line">
        {values.map((v) => (
          <div
            key={v.title}
            className="grid gap-x-12 gap-y-2 border-b border-line py-7 md:grid-cols-[minmax(0,18rem)_1fr] md:py-8"
          >
            {/* [hyphens:none]: die globale Silbentrennung fuer deutsche Komposita
                trennte hier "Transparen-te Kalkulation", obwohl die Spalte breit
                genug ist. In dieser Spalte wird nur am Leerzeichen umbrochen. */}
            <h3 className="text-[clamp(1.1rem,2vw,1.5rem)] leading-snug [hyphens:none]">{v.title}</h3>
            <p className="max-w-[58ch] text-sm leading-relaxed text-muted">{v.body}</p>
          </div>
        ))}
      </StackReveal>
    </Section>
  )
}

/** Sechs Hebel, nummeriert und am Scroll aufgebaut. Bleibt ruhiger als die
 *  Gipfel: kleine Schrift, kein Rot, nur der Aufbau als Bewegung. */
function Ressourcen() {
  return (
    <Section className="border-t border-line">
      <h2 className="max-w-[20ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.05]">
        Ressourcenschonende Logistik
      </h2>
      <StackReveal className="mt-14 grid gap-x-16 gap-y-0 sm:grid-cols-2">
        {sustainability.map((s) => (
          <div key={s.title} className="border-t border-line py-6">
            <h3 className="text-base leading-snug text-fg">{s.title}</h3>
            <p className="mt-1.5 max-w-[56ch] text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </StackReveal>
    </Section>
  )
}

/** Die Zertifikate sind der einzige harte Beweis auf der Seite — sie standen
 *  vorher als Kleinschrift in einer dreispaltigen Liste. Jetzt tragen die Codes
 *  Displaygroesse. */
/** Die Zertifikate tragen jetzt ihre echten Daten: Geltungsbereich, Registrier-
 *  nummer, Laufzeit — alles aus den Scans auf /unsere-zertifizierungen/, wo sie
 *  nur als Bilder mit leerem alt-Attribut liegen und damit weder durchsuchbar
 *  noch vorlesbar sind. */
function Zertifikate() {
  return (
    <Section className="border-t border-line">
      <div className="grid gap-x-16 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
        <h2 className="max-w-[20ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.05]">
          Geprüft, nicht behauptet
        </h2>
        <p className="max-w-[52ch] text-base leading-relaxed text-muted">
          Mit Geltungsbereich, Registriernummer und Laufzeit, wo ein Nachweis vorliegt —
          nachprüfbar beim TÜV SÜD statt nur als Logo im Seitenfuß.
        </p>
      </div>

      <StackReveal className="mt-14 border-t border-line">
        {certifications.map((c) => (
          <div
            key={c.id}
            className="grid items-start gap-x-10 gap-y-4 border-b border-line py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_7rem] md:py-10"
          >
            <div>
              <h3 className="text-[clamp(1.5rem,3.4vw,2.6rem)] leading-none">{c.code}</h3>
              {c.validLabel ? (
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-dim nums">
                  {c.validLabel}
                </p>
              ) : null}
              {/* Status offen ausweisen statt zu behaupten: beim ungeklaerten
                  Eintrag fehlt der Nachweis, beim IFS-Dokument ist die
                  Bestaetigung abgelaufen. Beides gehoert vor den Kundentermin
                  auf den Tisch, nicht hinter eine Behauptung. */}
              {!isCurrentlyCertified(c) ? (
                <p className="mt-3 inline-block rounded-sm border border-line px-2 py-1 text-xs text-dim">
                  {c.status === 'ungeklaert'
                    ? 'Nachweis liegt uns nicht vor'
                    : 'Folgebestätigung ausstehend'}
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-sm leading-relaxed text-muted">{c.note}</p>
              {c.scope ? (
                <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-fg">
                  <span className="text-faint">Geltungsbereich: </span>
                  {c.scope}
                </p>
              ) : null}
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-faint nums">
                {c.full}
                {c.registry ? <> · Reg. {c.registry}</> : null}
              </p>
            </div>

            {c.image ? (
              /* Zum Lesen oeffnen: in der Vorschau sind die Scans 80 bzw. 112 px
                 breit und damit unlesbar. Die Quelle hat nur 424x600 — eine
                 groessere Fassung existiert nicht, deshalb der direkte Link
                 statt eines Dialogs, der nichts Zusaetzliches zeigen koennte. */
              <a
                href={asset(`${c.image}-full.webp`)}
                target="_blank"
                rel="noopener"
                className="group block w-20 shrink-0 md:w-28"
                aria-label={`Zertifikat ${c.code} in lesbarer Größe öffnen`}
              >
                <img
                  src={asset(`${c.image}-420.webp`)}
                  srcSet={`${asset(`${c.image}-420.webp`)} 1x, ${asset(`${c.image}-840.webp`)} 2x`}
                  alt={`Zertifikat ${c.code} für ${c.scope ?? ''}, ausgestellt von ${c.issuer ?? ''}`}
                  width={420}
                  height={594}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-sm border border-line transition-colors duration-200 group-hover:border-red"
                />
                <span className="mt-2 block text-center text-[0.65rem] text-dim transition-colors duration-200 group-hover:text-red-hot">
                  Vergrößern
                </span>
              </a>
            ) : null}
          </div>
        ))}
      </StackReveal>

      {/* Die Partnerschaft ist kein Zertifikat und steht deshalb abgesetzt. Auf der
          Live-Seite liegt sie als Logo mit leerem alt-Attribut im Footer — hier
          traegt sie Text, damit Suchmaschinen und Screenreader sie erfassen. */}
      <Reveal className="mt-12">
        <div className="reveal grid items-center gap-x-12 gap-y-6 md:grid-cols-[minmax(0,20rem)_1fr]">
          <img
            src={asset(`${partnership.logo}.webp`)}
            alt={`${partnership.role} des ${partnership.name}`}
            width={500}
            height={150}
            loading="lazy"
            decoding="async"
            className="h-auto w-full max-w-[19rem]"
          />
          <div>
            <h3 className="text-lg leading-snug">
              {partnership.role} des {partnership.name}
            </h3>
            <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-muted">
              {partnership.note}
            </p>
          </div>
        </div>
      </Reveal>
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
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40"
      />
      <Reveal className="shell relative py-28 md:py-36">
        <h2 className="reveal max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
          Sagen Sie uns, was wohin soll. Den Rest klären wir.
        </h2>
        <p className="reveal mt-6 max-w-xl text-lg text-muted">
          Strecke, Ladung und Ihre Kontaktdaten genügen für ein Angebot — in zwei Minuten
          ausgefüllt.
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
