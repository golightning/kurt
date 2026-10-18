import { useEffect, useRef, type ReactNode } from 'react'
import { widthsFor } from '@/data/images'

/** Scroll reveal via IntersectionObserver plus a CSS transition.
 *
 *  Deliberately not GSAP ScrollTrigger: ScrollTrigger measures trigger positions at
 *  creation time, and on this page fonts and images settle the layout afterwards, so
 *  sections stayed hidden or stalled part-way through the tween. IntersectionObserver
 *  measures at intersection time and cannot go stale. If this never runs — no JS,
 *  reduced motion — the stylesheet leaves content visible, so nothing is ever lost to
 *  a failed animation. */
export function Reveal({
  children,
  className = '',
  stagger = 0.05,
  y = 20,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  y?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Own only the .reveal elements belonging to THIS container. Reveals nest (a
    // SectionHead inside a Reveal), and without this an outer container would also
    // claim the inner one's children.
    const targets = Array.from(el.querySelectorAll<HTMLElement>('.reveal')).filter(
      (t) => t.closest('[data-reveal]') === el,
    )
    if (!targets.length) return

    const show = () => {
      targets.forEach((t, i) => {
        t.style.transition = `opacity 620ms var(--ease-out-expo) ${i * stagger}s, transform 620ms var(--ease-out-expo) ${i * stagger}s`
        t.style.opacity = '1'
        t.style.transform = 'none'
      })
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((t) => {
        t.style.opacity = '1'
        t.style.transform = 'none'
      })
      return
    }

    targets.forEach((t) => {
      t.style.transform = `translateY(${y}px)`
    })

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show()
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [stagger, y])

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`py-24 md:py-32 ${className}`}>
      <div className="shell">{children}</div>
    </section>
  )
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  className = '',
}: {
  eyebrow: string
  title: string
  lead?: string
  className?: string
}) {
  // Carries its own Reveal container: the .reveal class starts at opacity 0, so a heading
  // placed outside one would stay invisible forever.
  return (
    <Reveal className={`max-w-2xl ${className}`}>
      <p className="eyebrow reveal">{eyebrow}</p>
      <h2 className="reveal mt-4 text-4xl leading-[1.05] md:text-5xl">{title}</h2>
      {lead ? <p className="reveal mt-6 text-lg leading-relaxed text-muted">{lead}</p> : null}
    </Reveal>
  )
}

/** Counts up once on scroll. Tabular figures keep the digits from shifting width while
 *  the number runs, so the layout does not twitch. Same IntersectionObserver reasoning
 *  as Reveal above. */
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const settle = () => {
      el.textContent = `${to}${suffix}`
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settle()
      return
    }

    let raf = 0
    const run = () => {
      const start = performance.now()
      const DURATION = 1400
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION)
        const eased = 1 - Math.pow(1 - t, 4) // quartic ease-out
        el.textContent = `${Math.round(eased * to)}${suffix}`
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, suffix])

  return (
    <span ref={ref} className="nums">
      0{suffix}
    </span>
  )
}

/** Responsive picture over the AVIF/WebP set produced by scripts/optimize-images.mjs.
 *  `base` is the path without width or extension, e.g. "/img/kuehltransport".
 *  The widths come from the generated manifest rather than a hardcoded list, because a
 *  small original yields fewer variants and referencing a missing one renders nothing. */
export function Picture({
  base,
  alt,
  className = '',
  imgClassName = '',
  sizes = '(min-width: 768px) 50vw, 100vw',
  loading = 'lazy',
}: {
  base: string
  alt: string
  className?: string
  imgClassName?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
}) {
  const widths = widthsFor(base)
  const set = (ext: string) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ')
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`${base}-${widths[widths.length - 1]}.webp`}
        alt={alt}
        loading={loading}
        decoding="async"
        className={imgClassName}
      />
    </picture>
  )
}
