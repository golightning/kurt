# Kompositions-Briefing: KURT-Werbeclip

## Rolle des Films
Werbung FÜR die Spedition. Absender ist KURT, Zielgruppe sind Verlader
(Einkauf, Logistikleitung, Disposition). Dass der Inhalt aus der neuen
Website stammt, ist der stille Beweis — er wird nie ausgesprochen.

**Verboten:** Byte-Zahlen, Ladezeiten, Lighthouse-Werte, "neue Website",
"Demo", Browser-Screenshots, jede Erwähnung der alten Seite.

## Projekte
- `composition/kurt-brag/`          1920×1080, 25s
- `composition/kurt-brag-vertical/` 1080×1920, 25s

Beide werden aus einer Quelle erzeugt, damit Text und Timing nicht
auseinanderlaufen. Unterschiede nur dort, wo das Format es erzwingt:
Typogrößen, Bildausschnitt, Routen-Seitenverhältnis.

## Szenen
| # | Fenster | Inhalt |
|---|---|---|
| 1 | 0,00–2,75 | Marke: das Z baut sich aus zwei Konturen auf. ULM · SEIT ÜBER 30 JAHREN |
| 2 | 2,75–5,90 | Fahrzeugfoto, Text unten: Ganzheitliche Logistiklösungen |
| 3 | 5,90–10,90 | Relation zeichnet sich: Ulm → Istanbul, Abzweig Thessaloniki |
| 4 | 10,90–14,75 | Auflieger bemaßt sich: Umriss, Stangen, 2,75 m, 13,60 m |
| 5 | 14,75–18,35 | Vier Leistungen als Welle + zwei Fahrzeugfotos |
| 6 | 18,35–21,75 | Nachweise: ISO 9001, IFS Logistics, SSV Ulm. Erreichbarkeit |
| 7 | 21,75–25,00 | Abbinder: Firmenname, Domain, Telefon |

Die Fenster stoßen lückenlos aneinander und enden exakt auf 25,0 s.

## Umgesetzte Technik
- Route und Auflieger sind **eigene SVG-Grafiken**, keine Screenshots.
  Die Linie entsteht über `stroke-dashoffset`, sie wird nicht eingeblendet.
- Stationen 1:1 aus `src/components/RouteLine.tsx`, Maße aus `src/data/site.ts`.
- Z-Marke: die gemessenen Konturen des echten Logos.
- Fotos: echtes Bildmaterial des Unternehmens aus `public/img/`.

## Gerechnete Entscheidungen
- **Bildausschnitt quer:** Foto 2048×1448 auf 1920×1080 → Faktor 0,938,
  80 % der Bildhöhe sichtbar. Beschriftung liegt bei y 412–656 im Bild.
- **Bildausschnitt hoch:** bei `object-position: 50%` begann das Fenster erst
  bei x 818 der skalierten Breite — die Wortmarke KURT (x 239–623) war damit
  komplett abgeschnitten. Auf 12 % gesetzt: Fenster x 196–1276, Logo,
  Schriftzug und Domain bleiben im Bild.
- **SVG-Text skaliert mit der viewBox.** Im Hochformat läuft der Auflieger auf
  Faktor 0,800: eine viewBox-Größe von 30 wäre als 24 px gerendert und damit
  unter dem 28-px-Lesefloor. Auf 38 gesetzt (= 30,4 px gerendert),
  Route auf 32 (= 30,6 px).
- **Textlage Szene 2:** mittig lag der Satz genau auf der Aufliegerbeschriftung
  und hat das Logo im eigenen Werbespot zerschnitten. Text nach unten,
  Schleier als Verlauf von unten.
- **Maßkette Auflieger:** Räder reichen bis y 329, die Längenkette lag auf
  y 352. Auf y 372 gesetzt, viewBox auf 450 erweitert.

## Qualitätsstand
`npm run check` in beiden Projekten: 0 Fehler über lint, runtime, layout,
motion, contrast und craft. Kontrast 25/25 WCAG AA.

Zwei Befunde kamen erst aus dem Kontaktbogen, nicht aus dem Check:
der zerschnittene Schriftzug und die fast leeren Szenenanfänge.
