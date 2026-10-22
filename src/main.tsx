import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '@/App'
import '@/index.css'

const root = document.getElementById('root')!
const tree = (
  <StrictMode>
    {/* basename: unter GitHub Pages liegt die App in /kurt/. Ohne das haelt der
        Router "/kurt/leistungen" fuer eine unbekannte Route und zeigt die
        404-Seite. import.meta.env.BASE_URL kommt aus vite.config. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Prerendered HTML is hydrated; the dev server renders fresh.
if (root.hasChildNodes()) hydrateRoot(root, tree)
else createRoot(root).render(tree)
