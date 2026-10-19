import { Link } from 'react-router-dom'
import { Picture, Reveal, Section, SectionHead } from '@/components/ui'
import { PageHero } from '@/components/PageHero'
import { services } from '@/data/site'

export function Leistungen() {
  return (
    <>
      <PageHero
        eyebrow="Branchenlösungen"
        title="Fünf Transportarten, fünf eigene Antworten"
        lead="Jede dieser Ladungen scheitert an einem Standardauflieger. Wir fahren sie, weil wir das passende Equipment und das Personal dafür haben."
      />

      {services.map((s, i) => (
        <Section
          key={s.slug}
          id={s.slug}
          className={i % 2 === 1 ? 'border-y border-line bg-ink-2' : ''}
        >
          <Reveal className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
              <span className="eyebrow reveal nums">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="reveal mt-4 text-3xl leading-tight md:text-4xl">{s.title}</h2>
              <p className="reveal mt-6 text-lg leading-relaxed text-muted">{s.body}</p>
              <ul className="reveal mt-8 grid gap-3 sm:grid-cols-3">
                {s.facts.map((f) => (
                  <li key={f} className="border-t border-line pt-3 text-xs leading-relaxed text-faint">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Picture
              base={s.image}
              alt={s.title}
              className="reveal block overflow-hidden rounded-sm border border-line"
              imgClassName="w-full h-auto aspect-[4/3] object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </Reveal>
        </Section>
      ))}

      <Section className="border-t border-line">
        <Reveal>
          <SectionHead
            eyebrow="Nicht dabei?"
            title="Beschreiben Sie die Ladung — wir sagen ehrlich, ob wir sie fahren können"
          />
          <div className="reveal mt-10">
            <Link
              to="/angebot"
              className="inline-block rounded-sm bg-red px-8 py-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98]"
            >
              Anfrage stellen
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
