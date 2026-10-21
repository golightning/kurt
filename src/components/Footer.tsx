import { Link } from 'react-router-dom'
import { ZMark } from '@/components/ZMark'
import { company, certifications, nav } from '@/data/site'

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <ZMark className="h-12 w-auto" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">{company.motto}</p>
          <address className="mt-6 not-italic text-sm leading-relaxed text-muted">
            {company.name}
            <br />
            {company.street}
            <br />
            {company.zip} {company.city}, {company.country}
          </address>
        </div>

        <nav aria-label="Footer-Navigation">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">Seiten</h2>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-muted transition-colors hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">Kontakt</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a
                href={`tel:${company.phoneHref}`}
                className="text-muted transition-colors hover:text-fg nums"
              >
                {company.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${company.email}`}
                className="text-muted transition-colors hover:text-fg"
              >
                {company.email}
              </a>
            </li>
            <li className="text-muted">{company.hours}</li>
          </ul>

          <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-faint">
            Zertifiziert
          </h2>
          {/* Nur was durch einen Zertifikatsscan belegt ist. ISO 27001 steht auf
              der Startseite mit offenem Status und gehoert nicht in diese Liste. */}
          <ul className="mt-4 flex flex-wrap gap-2">
            {certifications
              .filter((c) => c.status === 'belegt')
              .map((c) => (
                <li
                  key={c.id}
                  className="rounded-sm border border-line px-2.5 py-1 text-xs font-medium text-muted"
                >
                  {c.label}
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}
          </p>
          <p className="text-faint">
            Demo-Entwurf — kein Impressum, keine Datenschutzerklärung hinterlegt.
          </p>
        </div>
      </div>
    </footer>
  )
}
