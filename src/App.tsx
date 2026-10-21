import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { Leistungen } from '@/pages/Leistungen'
import { Fuhrpark } from '@/pages/Fuhrpark'
import { Angebot } from '@/pages/Angebot'
import { NichtGefunden } from '@/pages/NichtGefunden'
import { Kontakt } from '@/pages/Kontakt'
import { metaFor, SITE_URL } from '@/seo/meta'

/** The authoritative head tags are written statically by scripts/prerender.mjs — that is
 *  what crawlers read, and it is identical for every route. This only keeps the document
 *  in sync during client-side navigation, where no new document is fetched. */
function useDocumentMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = metaFor(pathname)
    document.title = meta.title

    const set = (selector: string, attr: string, value: string) => {
      const el = document.head.querySelector(selector)
      if (el) el.setAttribute(attr, value)
    }
    set('meta[name="description"]', 'content', meta.description)
    set('meta[property="og:title"]', 'content', meta.title)
    set('meta[property="og:description"]', 'content', meta.description)
    const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`
    set('link[rel="canonical"]', 'href', canonical)
    set('meta[property="og:url"]', 'content', canonical)
  }, [pathname])
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function Layout() {
  useDocumentMeta()
  return (
    <>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-red focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/leistungen" element={<Leistungen />} />
        <Route path="/fuhrpark" element={<Fuhrpark />} />
        <Route path="/angebot" element={<Angebot />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="*" element={<NichtGefunden />} />
      </Route>
    </Routes>
  )
}
