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

  const dir = page.path === '/' ? DIST : join(DIST, page.path.slice(1))
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'index.html'), out)
  console.log(`  ${page.path.padEnd(14)} -> ${join(dir, 'index.html')}  (${(out.length / 1024).toFixed(1)} KB)`)
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

console.log(`\n${pages.length} Seiten prerendert, sitemap.xml und robots.txt geschrieben.`)
