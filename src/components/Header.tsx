import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Wordmark } from '@/components/ZMark'
import { company, nav } from '@/data/site'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? 'border-b border-line bg-ink/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="shell flex h-20 items-center justify-between gap-6">
        <Link to="/" aria-label={`${company.short} — zur Startseite`}>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative rounded px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-fg' : 'text-muted hover:text-fg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={`absolute inset-x-4 -bottom-px h-px origin-left bg-red transition-transform duration-300 ease-[var(--ease-out-expo)] ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${company.phoneHref}`}
            className="hidden text-sm font-medium text-muted transition-colors hover:text-fg lg:block nums"
          >
            {company.phone}
          </a>
          <Link
            to="/angebot"
            className="hidden rounded-sm bg-red px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-red-hot active:scale-[0.98] sm:block"
          >
            Angebot anfordern
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-sm border border-line text-fg md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Menü schliessen' : 'Menü öffnen'}
          >
            <span className="relative block h-3 w-5">
              <span
                className={`absolute inset-x-0 h-px bg-current transition-transform duration-300 ease-[var(--ease-out-expo)] ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute inset-x-0 h-px bg-current transition-transform duration-300 ease-[var(--ease-out-expo)] ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-line transition-[height] duration-300 ease-[var(--ease-out-expo)] md:hidden ${
          open ? 'h-72' : 'h-0'
        }`}
      >
        <nav className="shell flex flex-col gap-1 py-5" aria-label="Navigation (mobil)">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded px-2 py-3 text-base font-medium ${isActive ? 'text-red' : 'text-fg'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/angebot"
            className="mt-2 rounded-sm bg-red px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Angebot anfordern
          </Link>
        </nav>
      </div>
    </header>
  )
}
