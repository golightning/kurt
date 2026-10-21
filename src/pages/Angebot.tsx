import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHero } from '@/components/PageHero'
import { Reveal, Section } from '@/components/ui'
import { company, ladungsarten, transportarten } from '@/data/site'

type Fields = {
  firma: string
  ansprechpartner: string
  email: string
  telefon: string
  ladestelle: string
  entladestelle: string
  gewicht: string
  masse: string
  ladungsart: string
  transportart: string
  nachricht: string
}

const EMPTY: Fields = {
  firma: '',
  ansprechpartner: '',
  email: '',
  telefon: '',
  ladestelle: '',
  entladestelle: '',
  gewicht: '',
  masse: '',
  ladungsart: '',
  transportart: '',
  nachricht: '',
}

const STEPS = [
  { id: 0, label: 'Strecke', fields: ['ladestelle', 'entladestelle', 'transportart'] as const },
  { id: 1, label: 'Ladung', fields: ['gewicht', 'masse', 'ladungsart'] as const },
  { id: 2, label: 'Kontakt', fields: ['firma', 'ansprechpartner', 'email', 'telefon'] as const },
]

export function Angebot() {
  const [step, setStep] = useState(0)
  const [v, setV] = useState<Fields>(EMPTY)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState(false)
  // Sperrt den Submit fuer einen Tick nach dem Schrittwechsel, damit der Klick,
  // der "Weiter" ausgeloest hat, nicht auch den an dieselbe Stelle gerueckten
  // Absenden-Button trifft.
  const justAdvanced = useRef(false)
  const doneRef = useRef<HTMLHeadingElement>(null)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Fields, string>> = {}
    if (!v.ladestelle.trim()) e.ladestelle = 'Bitte angeben'
    if (!v.entladestelle.trim()) e.entladestelle = 'Bitte angeben'
    if (!v.transportart) e.transportart = 'Bitte wählen'
    if (!v.gewicht.trim()) e.gewicht = 'Bitte angeben'
    if (!v.ladungsart) e.ladungsart = 'Bitte wählen'
    if (!v.firma.trim()) e.firma = 'Bitte angeben'
    if (!v.ansprechpartner.trim()) e.ansprechpartner = 'Bitte angeben'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = 'Gültige E-Mail-Adresse nötig'
    return e
  }, [v])

  const stepValid = STEPS[step].fields.every((f) => !errors[f])

  const set = (k: keyof Fields) => (e: { target: { value: string } }) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }))

  // Nach dem Absenden bleibt sonst die alte Scrollposition stehen; bei 390 px
  // lag die Danke-Ueberschrift 333 px oberhalb des sichtbaren Bereichs.
  useEffect(() => {
    if (!done) return
    const el = doneRef.current
    if (!el) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    el.focus({ preventScroll: true })
  }, [done])

  const markTouched = () =>
    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(STEPS[step].fields.map((f) => [f, true])),
    }))

  if (done) {
    return (
      <>
        <PageHero
          eyebrow="Anfrage"
          title="Danke — das genügt uns."
          titleRef={doneRef}
        />
        <Section>
          <Reveal className="max-w-2xl">
            <p className="reveal text-lg leading-relaxed text-muted">
              In der fertigen Seite ginge Ihre Anfrage jetzt direkt an die Disposition in Ulm.
            </p>
            <div className="reveal mt-8 rounded-sm border border-red/30 bg-red/5 p-5 text-sm leading-relaxed text-muted">
              <strong className="text-fg">Hinweis zur Demo:</strong> Dieses Formular versendet
              nichts. Die Eingaben bleiben im Browser und werden nirgendwohin übertragen.
            </div>
            <button
              type="button"
              onClick={() => {
                setV(EMPTY)
                setTouched({})
                setStep(0)
                setDone(false)
              }}
              className="reveal mt-8 rounded-sm border border-line px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-red hover:text-red"
            >
              Noch eine Anfrage
            </button>
          </Reveal>
        </Section>
      </>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Unverbindliches Angebot"
        title="Drei Schritte, dann rechnen wir"
        lead="Strecke, Ladung, Kontakt — in zwei Minuten ausgefüllt. Für ein belastbares Angebot genügt, was hier abgefragt wird."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <Reveal>
            {/* Step indicator */}
            <ol className="reveal flex gap-2" aria-label="Fortschritt">
              {STEPS.map((s) => (
                <li key={s.id} className="flex-1">
                  <div
                    className={`h-0.5 transition-colors duration-500 ${
                      s.id <= step ? 'bg-red' : 'bg-line'
                    }`}
                  />
                  <p
                    className={`mt-3 text-xs font-medium transition-colors duration-300 ${
                      s.id <= step ? 'text-fg' : 'text-faint'
                    }`}
                  >
                    <span className="nums">{s.id + 1}</span> · {s.label}
                  </p>
                </li>
              ))}
            </ol>

            <form
              className="reveal mt-12"
              onSubmit={(e) => {
                e.preventDefault()
                if (justAdvanced.current) return
                markTouched()
                if (Object.keys(errors).length === 0) setDone(true)
              }}
              noValidate
            >
              {step === 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Ladestelle" hint="PLZ und Ort genügen" error={touched.ladestelle ? errors.ladestelle : undefined}>
                    <input className={inputCls} value={v.ladestelle} onChange={set('ladestelle')} placeholder="89081 Ulm" autoComplete="off" />
                  </Field>
                  <Field label="Entladestelle" hint="PLZ und Ort genügen" error={touched.entladestelle ? errors.entladestelle : undefined}>
                    <input className={inputCls} value={v.entladestelle} onChange={set('entladestelle')} placeholder="34000 Istanbul" autoComplete="off" />
                  </Field>
                  <Field label="Art des Transports" asGroup className="sm:col-span-2" error={touched.transportart ? errors.transportart : undefined}>
                    <ChipGroup options={transportarten} value={v.transportart} onChange={(val) => setV((p) => ({ ...p, transportart: val }))} />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Sendungsgewicht" hint="z. B. 12.400 kg" error={touched.gewicht ? errors.gewicht : undefined}>
                    <input className={inputCls} value={v.gewicht} onChange={set('gewicht')} placeholder="12.400 kg" inputMode="decimal" />
                  </Field>
                  <Field label="Maße" hint="Länge × Breite × Höhe in m — optional">
                    <input className={inputCls} value={v.masse} onChange={set('masse')} placeholder="13,60 × 2,45 × 2,75" />
                  </Field>
                  <Field label="Art der Ladung" asGroup className="sm:col-span-2" error={touched.ladungsart ? errors.ladungsart : undefined}>
                    <ChipGroup options={ladungsarten} value={v.ladungsart} onChange={(val) => setV((p) => ({ ...p, ladungsart: val }))} />
                  </Field>
                  <Field label="Anmerkungen" hint="Optional" className="sm:col-span-2">
                    <textarea className={`${inputCls} min-h-28 resize-y`} value={v.nachricht} onChange={set('nachricht')} placeholder="Temperaturbereich, Zeitfenster, Besonderheiten …" />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Firma" error={touched.firma ? errors.firma : undefined}>
                    <input className={inputCls} value={v.firma} onChange={set('firma')} autoComplete="organization" />
                  </Field>
                  <Field label="Ansprechpartner" error={touched.ansprechpartner ? errors.ansprechpartner : undefined}>
                    <input className={inputCls} value={v.ansprechpartner} onChange={set('ansprechpartner')} autoComplete="name" />
                  </Field>
                  <Field label="E-Mail" error={touched.email ? errors.email : undefined}>
                    <input className={inputCls} value={v.email} onChange={set('email')} type="email" autoComplete="email" />
                  </Field>
                  <Field label="Telefon" hint="Optional">
                    <input className={inputCls} value={v.telefon} onChange={set('telefon')} type="tel" autoComplete="tel" />
                  </Field>
                  <p className="sm:col-span-2 rounded-sm border border-line bg-surface p-4 text-xs leading-relaxed text-faint">
                    Demo-Entwurf: Dieses Formular überträgt keine Daten. Alles bleibt in Ihrem Browser.
                  </p>
                </div>
              )}

              <div className="mt-10 flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-sm border border-line px-6 py-3 text-sm font-semibold text-muted transition-colors hover:text-fg"
                  >
                    Zurück
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      markTouched()
                      if (stepValid) {
                        justAdvanced.current = true
                        setStep((s) => s + 1)
                        // Im naechsten Frame wieder freigeben: dann ist der
                        // ausloesende Klick lange durch.
                        requestAnimationFrame(() => {
                          justAdvanced.current = false
                        })
                      }
                    }}
                    className="rounded-sm bg-red px-7 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98]"
                  >
                    Weiter
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="rounded-sm bg-red px-7 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98]"
                  >
                    Anfrage abschicken
                  </button>
                )}
              </div>
            </form>
          </Reveal>

          <Reveal>
            <aside className="reveal rounded-sm border border-line bg-ink-2 p-7 lg:sticky lg:top-28">
              <h2 className="text-lg">Lieber direkt sprechen?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Bei eiligen oder ungewöhnlichen Sendungen geht das Telefon meist schneller.
              </p>
              <a
                href={`tel:${company.phoneHref}`}
                className="mt-6 block font-display text-2xl font-extrabold text-fg transition-colors hover:text-red nums"
              >
                {company.phone}
              </a>
              <p className="mt-2 text-xs text-faint">{company.hours}</p>
              <div className="mt-6 border-t border-line pt-5">
                <a href={`mailto:${company.email}`} className="text-sm text-muted transition-colors hover:text-fg">
                  {company.email}
                </a>
              </div>
            </aside>
          </Reveal>
        </div>
      </Section>
    </>
  )
}

const inputCls =
  'w-full rounded-sm border border-line bg-surface px-4 py-3 text-sm text-fg placeholder:text-faint transition-colors duration-200 focus:border-red focus:outline-none'

function Field({
  label,
  hint,
  error,
  className = '',
  children,
  asGroup = false,
}: {
  label: string
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
  /** Fuer Gruppen aus Buttons statt eines Eingabefelds. Ein `label` um mehrere
   *  Buttons gibt dem ERSTEN den Gruppentext als zugaenglichen Namen — der
   *  Transport-Button war dadurch nicht unter "Komplettladung (FTL)"
   *  ansprechbar, sondern unter dem Text der ganzen Gruppe. */
  asGroup?: boolean
}) {
  const head = (
    <>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      {hint && !error ? <span className="text-[0.65rem] text-faint">{hint}</span> : null}
      {error ? <span className="text-[0.65rem] font-medium text-red-hot">{error}</span> : null}
    </>
  )

  if (asGroup) {
    return (
      <fieldset className={`block border-0 p-0 ${className}`}>
        <legend className="flex w-full items-baseline justify-between gap-3">{head}</legend>
        <div className="mt-2.5 block">{children}</div>
      </fieldset>
    )
  }

  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline justify-between gap-3">{head}</span>
      <span className="mt-2.5 block">{children}</span>
    </label>
  )
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <span className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-sm border px-4 py-2 text-sm transition-colors duration-200 ${
            value === o
              ? 'border-red bg-red/10 text-fg'
              : 'border-line text-muted hover:border-faint hover:text-fg'
          }`}
        >
          {o}
        </button>
      ))}
    </span>
  )
}
