import { Reveal } from '@/components/ui'

export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string
  title: string
  lead?: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-[0.13] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #e20613 0%, transparent 65%)' }}
      />
      <Reveal className="shell relative py-24 md:py-32">
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="reveal mt-5 max-w-4xl text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.02]">
          {title}
        </h1>
        {lead ? (
          <p className="reveal mt-7 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>
        ) : null}
      </Reveal>
    </section>
  )
}
