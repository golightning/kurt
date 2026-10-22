import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from '@/App'

/** Rendered once per route by scripts/prerender.mjs. Effects do not run here, so the
 *  3D canvas is never created server-side — ZMarkStage falls back to the vector mark,
 *  which is exactly what a crawler and a no-JS visitor should get. */
export function render(path: string): string {
  // Der Aufrufer uebergibt den Pfad OHNE Basispfad ("/kontakt"). Mit gesetztem
  // `basename` erwartet der Router ihn aber MIT ("/kurt/kontakt") und rendert
  // sonst gar nichts — die Seiten kamen dadurch als leere Huelle heraus.
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return renderToString(
    <StaticRouter location={`${base}${path}`} basename={import.meta.env.BASE_URL}>
      <App />
    </StaticRouter>,
  )
}
