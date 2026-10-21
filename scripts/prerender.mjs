// Writes one real HTML file per route: dist/index.html, dist/leistungen/index.html, …
// Each gets its own title, description, canonical, Open Graph tags and LocalBusiness
// JSON-LD. This is the part the live WordPress site is missing entirely — no sitemap,
// no description, no structured data.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pages, organizationJsonLd, SITE_URL } from '../dist-ssr/meta.js'
import { render } from '../dist-ssr/entry-server.js'

const DIST = 'dist'
const shell = await readFile(join(DIST, 'index.html'), 'utf8')

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const headFor = (page) => {
  const canonical = `${SITE_URL}${page.path === '/' ? '' : page.path}`
  return [
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="KURT Internationale Transporte GmbH" />`,
    `<meta property="og:locale" content="de_DE" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    // og:image fehlte: beim Teilen in WhatsApp, LinkedIn oder Slack blieb die
    // Vorschau leer. 1200x630 ist das Format, das alle gaengigen Dienste erwarten.
    `<meta property="og:image" content="${SITE_URL}/og-image.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="KURT Internationale Transporte GmbH — Ganzheitliche Logistikloesungen aus Ulm" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${JSON.stringify(organizationJsonLd)}</script>`,
  ].join('\n    ')
}

for (const page of pages) {
  const html = render(page.path)

  const out = shell
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${esc(page.title)}</title>\n    ${headFor(page)}`,
    )
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

  // Zwei Dateien je Route: <route>/index.html UND <route>.html.
  //
  // Mit nur der Ordnervariante liefert ein Aufruf ohne abschliessenden Slash
  // (/kontakt) bei `vite preview` und bei vielen statischen Hostern den
  // SPA-Fallback, also das Startseiten-HTML. Der Client baut die Seite dann neu
  // auf und meldet dabei eine Hydration-Abweichung (React #418). Interne Links
  // und die Sitemap nutzen Pfade ohne Slash, also ist das der haeufigere Fall.
  // Die zweite Datei kostet wenige KB und macht beide Schreibweisen korrekt.
  if (page.path === '/') {
    await writeFile(join(DIST, 'index.html'), out)
    console.log(`  ${page.path.padEnd(14)} -> dist/index.html  (${(out.length / 1024).toFixed(1)} KB)`)
  } else {
    const slug = page.path.slice(1)
    const dir = join(DIST, slug)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), out)
    await writeFile(join(DIST, `${slug}.html`), out)
    console.log(
      `  ${page.path.padEnd(14)} -> dist/${slug}/index.html + dist/${slug}.html  (${(out.length / 1024).toFixed(1)} KB)`,
    )
  }
}

// Sitemap and robots — both absent on the live site.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) =>
      `  <url><loc>${SITE_URL}${p.path === '/' ? '/' : p.path}</loc><changefreq>monthly</changefreq><priority>${p.path === '/' ? '1.0' : '0.8'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`
await writeFile(join(DIST, 'sitemap.xml'), sitemap)
await writeFile(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
)

// 404.html: die meisten statischen Hoster (Netlify, Vercel, GitHub Pages,
// Cloudflare Pages, S3) liefern diese Datei mit HTTP-Status 404 aus. Ohne sie
// beantwortet der SPA-Fallback jeden unbekannten Pfad mit 200 — die Seite zeigt
// dann zwar "nicht gefunden", Suchmaschinen indexieren sie aber als gueltig.
const notFound = render('/nicht-gefunden')
await writeFile(
  join(DIST, '404.html'),
  shell
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>Seite nicht gefunden | KURT Internationale Transporte GmbH</title>\n    ` +
        [
          `<meta name="description" content="Diese Adresse existiert nicht. Hier geht es zu Leistungen, Fuhrpark und Kontakt." />`,
          `<meta name="robots" content="noindex" />`,
        ].join('\n    '),
    )
    .replace('<div id="root"></div>', `<div id="root">${notFound}</div>`),
)

console.log(
  `\n${pages.length} Seiten prerendert, dazu 404.html, sitemap.xml und robots.txt.`,
)
