import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from '@/App'

/** Rendered once per route by scripts/prerender.mjs. Effects do not run here, so the
 *  3D canvas is never created server-side — ZMarkStage falls back to the vector mark,
 *  which is exactly what a crawler and a no-JS visitor should get. */
export function render(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <App />
    </StaticRouter>,
  )
}
