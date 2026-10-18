# KURT Internationale Transporte — Website-Demo

Akquise-Demo für **KURT Internationale Transporte GmbH**, Ulm. Fünf Seiten, gebaut aus
den Inhalten der bestehenden WordPress-Seite (Analyse: [`docs/ANALYSE.md`](docs/ANALYSE.md)).

> **Hinweis:** Dies ist ein Entwurf zu Präsentationszwecken, nicht die Seite des Kunden.
> Das Angebotsformular versendet nichts, und es sind weder Impressum noch
> Datenschutzerklärung hinterlegt.

---

## Schnellstart

```sh
# Einmalig: der echte Node liegt hinter einer kaputten PATH-Datei, siehe docs/UMGEBUNG.md
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

npm install
npm run dev        # Entwicklungsserver
npm run build      # Produktions-Build inkl. Prerendering, Sitemap und robots.txt
npm run preview    # gebaute Seite lokal ausliefern
npm run images     # Bildpipeline + Logo-SVG + Favicon neu erzeugen
```

---

## Stack

| | |
|---|---|
| React | 19.3 |
| Vite | 8.3 |
| TypeScript | 5.9 |
| Tailwind CSS | 4.3 (CSS-first, kein `tailwind.config.js`) |
| React Router | 7.18 |
| three.js / R3F | 0.186 / fiber 9, drei 10 |
| Bilder | `sharp` → AVIF + WebP, responsive |

### Abweichungen vom `golightning-website`-Referenzstack — und warum

- **`react-helmet-async` entfällt.** Seit 2023 nicht mehr gepflegt, Peer-Konflikte mit
  React 19. Die Head-Tags schreibt stattdessen der Prerender-Schritt statisch; der Client
  hält sie bei SPA-Navigation nur noch nach.
- **Kein reines SPA.** `scripts/prerender.mjs` rendert jede Route zu echtem HTML. Für eine
  Spedition, die über „Spedition Ulm" gefunden werden muss, ist das der entscheidende Punkt.
- **`vite-react-ssg` wurde verworfen.** Die aktuelle Version 0.9.2 peert nur auf
  React Router **6** und zieht ausgerechnet `react-helmet-async@1` als Abhängigkeit mit.
  Der eigene Prerender-Schritt sind rund 60 Zeilen und hat keine dieser Einschränkungen.
- **GSAP wieder entfernt.** ScrollTrigger misst Trigger-Positionen zum Erstellungszeitpunkt;
  auf dieser Seite legen Schriften und Bilder das Layout danach noch einmal um, wodurch
  Abschnitte unsichtbar blieben oder mitten im Tween stehenblieben. Die Reveals laufen jetzt
  über `IntersectionObserver` plus CSS-Transition — robuster und ohne Abhängigkeit.

---

## Projektstruktur

```
src/
  data/site.ts          Sämtliche Inhalte an einer Stelle (aus der Analyse)
  data/images.ts        GENERIERT — welche Bildbreiten tatsächlich existieren
  seo/meta.ts           Titel, Descriptions, LocalBusiness-JSON-LD je Route
  components/
    ZMark.tsx           GENERIERT — Logo als Vektor aus den gemessenen Konturen
    ZMarkStage.tsx      Lädt das 3D-Hero nachgelagert, mit Vektor-Fallback
    ZMarkCanvas.tsx     Die WebGL-Hälfte (eigener, lazy geladener Chunk)
    ui.tsx              Reveal, Section, SectionHead, Counter, Picture
  three/
    createKurtZMarkModel.ts   GENERIERT von img2threejs aus dem Logo-Bild
  pages/                Home, Leistungen, Fuhrpark, Angebot, Kontakt
scripts/
  optimize-images.mjs   Originale → responsive AVIF/WebP + Manifest
  gen-zmark.mjs         Konturen → ZMark.tsx
  gen-favicon.mjs       Konturen → favicon.svg
  prerender.mjs         Statisches HTML je Route + sitemap.xml + robots.txt
preview.html            Standalone-Ansicht nur für das 3D-Modell (Entwicklung)
```

Drei Dateien sind generiert und sollten nicht von Hand bearbeitet werden:
`src/components/ZMark.tsx`, `src/data/images.ts`, `src/three/createKurtZMarkModel.ts`.

---

## Die 3D-Marke

Das Z im Hero ist **das Logo des Kunden**, nicht eine Nachempfindung. Die Kontur wurde mit
einer Moore-Nachbarschafts-Randverfolgung aus dem Original-Raster extrahiert und mit
Ramer-Douglas-Peucker bei 1,1 px vereinfacht (95 Punkte rot, 55 Punkte grau). Gegen die
Referenz erreicht die rote Maske **IoU 0,99486**. Die Farben sind ausgezählt, nicht geschätzt:
`#e20613` über 994.988 Pixel und `#708296` über 236.336 Pixel.

Ablauf und Prüfprotokoll: [`docs/3D-MARKE.md`](docs/3D-MARKE.md), Spec in
`object-sculpt-spec.json`, Belege unter `.img2threejs/`.

Das 3D-Modell steht nur zur Verfügung, wenn WebGL2 vorhanden ist und der Nutzer keine
reduzierte Bewegung angefordert hat. Sonst — und bis der Chunk geladen ist — zeigt der
Hero die Vektormarke.
