# Hyperframes Composition Brief: KURT Internationale Transporte — Website-Demo

## Objective
Kurzes Launch-Video für die Akquise-Demo einer Ulmer Spedition.

## Output
- Composition: `brag-output/composition/`
- Videos: `brag-output/brag.mp4` (1920×1080) und `brag-output/brag-vertical.mp4` (1080×1920)
- Duration: 20s

## Source Material
- Projektwurzel: `/Users/tolgahisir/Desktop/Dev/kurt`, live unter https://golightning.github.io/kurt/
- Gelesen: `src/index.css` (Tokens), `src/data/site.ts` (Inhalte), `src/pages/Home.tsx`
- Produkt: KURT Internationale Transporte GmbH — Website-Demo
- Stärkster Claim: 136.243 → 9.688 Bytes; 9,87 MB → 0,55 MB Bilder
- Echte Screenshots in `assets/`: route, riss, liste, zert, mobil, desktop
- Wörtlich zu zeigen:
  - „Ganzheitliche Logistiklösungen"
  - „Von Ulm bis Istanbul und Thessaloniki"
  - „13,60 m Ladelänge" / „2,75 m"
  - „Spedition aus Ulm, seit über 30 Jahren"

## Creative Direction
- Preset: `polished`
- Richtung: stiller Beweis statt lautes Versprechen
- Umsetzung: lange Haltezeiten, weiche Schnitte, kein Zoom-Gewitter. Rot nur als Signal.
- Angle: Die alte Seite behauptet, die neue zeigt. Jede Szene ist ein nachprüfbarer Beleg.
- Hook: rotes Z auf Schwarz, darunter „Spedition aus Ulm. Seit über 30 Jahren."
- Outro: „Die Seite, die er noch nicht hat." + URL
- Avoid: Agenturdeutsch, abstrakte Füller, Redesign der Marke

## Visual Identity
- Hintergrund `#08080a`, Abschnitt `#0e0e12`
- Text `#f4f4f6`, gedämpft `#9b9ba6`, leise `#80808d`
- Akzent `#e20613`, Text-Rot `#ff4a3d`
- Display: Archivo (lokal `fonts/archivo.woff2`)
- Body: Inter (lokal `fonts/inter.woff2`)

## Storyboard
1. **Hook** — 3,0s — Z baut sich auf, „Spedition aus Ulm. Seit über 30 Jahren."
2. **Leistungen** — 3,0s — `liste.webp`, Zeile „Fracht, die nicht auf eine Standardpalette passt"
3. **Route** — 4,0s — `route.webp`, Titel „Von Ulm bis Istanbul"
4. **Riss** — 4,0s — `riss.webp`, Maße treten hervor
5. **Zahlen** — 3,5s — 136.243 → 9.688 Bytes als Gegenüberstellung
6. **Outro** — 2,5s — Z klein, „Die Seite, die er noch nicht hat.", URL

## Audio
- Rolle: sparsame professionelle Akzente
- Arc: ruhig einsetzen, unter dem Bild bleiben, am Ende ausblenden
- Musik: `assets/music.mp3` (Happy Beats / Business Moves Vol. 10, 110 BPM)
- Treatment: ab 0,2s, Volume 0,28, Fade-out ab 18,0s
- Cue-Guidance: Preset gelesen. Beat-Grid ab 0,27s, einziger Strong Cue bei 20,19s —
  liegt auf dem Abbinder. Szenenschnitte am Grid orientieren (3,01 / 6,82 / 10,93 / 15,28 / 18,01).
- Audio-reaktiv: keine
- SFX: sparsam, drei Einsätze. `tick.ogg` und `tick2.ogg` sind `impactSoft_medium`
  (Centroid 81–90 Hz, highFrequencyRisk „low", warm) — tiefe weiche Impulse, keine Klicks.
  `outro.ogg` ist `bong_001` (203 Hz, low, warm) für den Schlusspunkt.
- Gekoppelte Momente: Szenenwechsel Route (6,8s), Maßlinie (11,0s), Outro (17,6s)
- Restraint: keine Whooshes, kein Riser, kein Impact auf dem Logo.

## Hyperframes Instructions
Siehe `hyperframes-core` (Kontrakt), `-animation`, `-creative`, `-keyframes`, `-cli`.
Nicht in den generischen Promo-Workflow routen.
