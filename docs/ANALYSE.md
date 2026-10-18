# Analyse: kurt-transport.com

**Ziel:** Rekonstruktionsgrundlage für eine React-Demo als Akquise-Pitch
**Stand:** 2026-10-18
**Methode:** HTTP-Abruf aller 13 Seiten (curl), DOM-/Computed-Style-Inspektion im Browser, Asset-Inventar

---

## 1. Unternehmen (Fakten aus Impressum/Kontakt)

| Feld | Wert |
|---|---|
| Firma | KURT Internationale Transporte GmbH |
| Geschäftsführer | Oktay Kurt |
| Adresse | Hörvelsingerweg 52/2, 89081 Ulm, Deutschland |
| Telefon | +49 731 401 700 |
| Fax | +49 731 401 7020 |
| E-Mail | info@kurt-transport.com |
| Öffnungszeiten | Mo–Fr 7:00–17:00 |
| Registergericht | Ulm |
| Schwesterfirma | Kurt. Cargo. Competence. GmbH (KCC) |
| Zertifizierungen | DIN EN ISO 9001:2015, DIN ISO 27001:2013, IFS Logistics / IFS Progress Logistics 2024 |
| Social | Facebook, Instagram |

**Positionierung:** „Regional führender Anbieter ganzheitlicher Logistiklösungen", seit ~3 Jahrzehnten.
**Motto:** „Erfolg verlangt Umwege, doch wir streben nach Abkürzungen."

---

## 2. Technischer Ist-Zustand

| Komponente | Wert |
|---|---|
| CMS | WordPress |
| Theme | `expeditor` + `expeditor-child` (ThemeForest-Logistik-Theme) |
| Page Builder | WPBakery / `js_composer` |
| Slider | Slider Revolution 6.3.8 (Release 2020) |
| Formulare | Contact Form 7 + Elfsight Contact Form + reCAPTCHA |
| Cookie-Consent | Borlabs Cookie (kostenpflichtig) |
| Weitere Plugins | `expeditor-content-types`, `vc-extensions-bundle`, `wp-user-avatar` |
| Sprache | nur Deutsch (`lang="de"`) |
| Sitemap | **fehlt** (`/sitemap.xml` liefert 404-HTML) |
| robots.txt | WordPress-Default, kein Sitemap-Verweis |

### Gefundene Schwachstellen (= Verkaufsargumente)

1. **Performance:** Startseite liefert 136 KB HTML; Bilder völlig unoptimiert —
   `IFS-Progress-Logistics-2024.jpg` = **2,76 MB**, `Europa-Deutschland_1.png` = **2,26 MB**,
   `projektladung.jpg` = **1,56 MB**. Kein WebP/AVIF, kein `srcset`-Konzept. TTFB ~1,05 s.
2. **SEO:** Keine `<meta name="description">` auf der Startseite. Keine Sitemap.
   Keine Open-Graph-Tags für Social Sharing. Kein LocalBusiness-/Organization-Schema —
   fatal für „Spedition Ulm"-Suchanfragen.
3. **Struktur:** H1 fehlt auf der Startseite (beginnt bei H4/H3) — gebrochene Heading-Hierarchie.
4. **Inhalt:** Mehrere Tippfehler im Live-Text („Logisitiklösungen", „präsise", „Emiisionen",
   „Kraftstoffverbrqauch", „drei Jahrzenten", „Nicht ist uns so wichtig", „Ergenis",
   „Ansprechspartner" im Formular).
5. **Recht:** Impressum ohne **USt-IdNr.** und ohne **HRB-Nummer** → §5 TMG unvollständig.
   Copyright-Zeile steht auf **2021**.
6. **Aktualität:** Slider Revolution 6.3.8 ist mehrere Jahre alt (bekannte CVE-Historie).
   Letzte News-Meldung Mai 2025.
7. **Seiten-Slug** `/unternehmen-2/` verrät eine Alt-Seitenleiche.
8. **Content-Lücken:** Zertifizierungsseite ist eine reine Bildergalerie ohne Text (0 Wörter für
   Google). Kontaktseite hat keine Karte und kein Formular — nur Textblock.

---

## 3. Seitenstruktur (13 Seiten)

```
/                                        Startseite
/unternehmen-2/                          Unternehmen
  /unsere-zertifizierungen/              Zertifizierungen
  /karriere/                             Stellenausschreibungen
/logistik/                               Logistik
/nationale-internationale-transporte/    Nationale & Internationale Transporte
/branchenloesungen/                      Branchenlösungen
/fuhrpark/                               Fuhrpark
/neuigkeiten/                            Neuigkeiten (Blog)
/kontakt/                                Kontakt
/angebot-holen/                          Unverbindliches Angebot
/impressum/                              Impressum
/datenschutz/                            Datenschutz
```

### Navigation (Hauptmenü)
`STARTSEITE` · `UNTERNEHMEN ▾` · `LEISTUNGEN ▾` · `FUHRPARK` · `NEUIGKEITEN` · `KONTAKT`
Topbar rechts: `Karriere` · `Anfrage` · `Kontakt`
Header-Leiste: Logo · Telefon · E-Mail · Öffnungszeiten · CTA-Button „Angebot anfordern"

### Footer
Spalte 1 „Kontaktieren Sie uns" (Adresse/Tel/Mail) · Spalte 2 „Über uns" · Spalte 3 „Leistungen"
Copyright-Zeile + Datenschutz · Impressum · Kontakt

---

## 4. Inhalt je Seite

### Startseite
- Hero (Slider Revolution, 3 Slides: „Hero Collection", „Ken Burns", „Video") — Headline „THE BEST SOLUTION"
- Intro: „Herzlich willkommen auf der Webseite von KURT Internationale Transporte in Ulm." + Motto
- 4 Wert-Karten: **Sicherheit** · **Teamwork** · **Transparente Kalkulation** · **Haben Sie noch Fragen?**
- 3 Leistungs-Karten: **Transporte** · **Bekleidung** · **Kühltransporte**
- Counter-Sektion (Jahre Erfahrung / zufriedene Kunden / gefahrene Kilometer / Länder)
- „Flexibel - zuverlässig – zeitnah" + Angebotsformular „ERHALTEN SIE EIN ANGEBOT"
- CTA: „Wir finden eine effiziente Lösung, die Ihren Anforderungen entspricht."

### Unternehmen
H2 „Wer wir sind" · H2 „Unsere Philosophie – Der Kunde ist König" · H2 „Möchten Sie unserem Team beitreten?"
Team-Kategorien: Allgemein / LKW / Verwaltung · CTA „Wir suchen Verstärkung!"

### Logistik
H2 „Unsere Lösungen für eine ressourcenschonende Logistik" — 8 Maßnahmen:
Lieferungsbündelung · Reduzierung Be-/Entladezeiten · Vermeidung von Leerfahrten ·
Ausbau Elektromobilität · Euro6-LKWs · rollwiderstandsarme Reifen · Fahrerschulungen

### Nationale & Internationale Transporte
H2 „NATIONALE VERKEHRE" (FTL, moderner Fuhrpark) ·
H2 „Internationale Verkehre" (West-/Zentraleuropa bis Türkei und Griechenland)

### Branchenlösungen (5 Leistungen)
Filialbelieferung · Bekleidung hängend (Innenhöhe 2,75 m, 3-fach Hängung) ·
Temperaturgeführte Transporte (Frischdienst/TK, Echtzeitprotokollierung, Alarm) ·
Schwer- und Sondertransporte · Projektladungsnetzwerk (Straße/Schiene/Übersee)

### Fuhrpark — H2 „Eine Lösung für jede Ladung" (6 Fahrzeugtypen)
13,60 Textil-Koffersattel XL-CODE · 13,60 Koffersattel mit Hebebühne XL-CODE ·
13,60 Kühlauflieger · 12 t LKW · 7,49 t LKW · Sattelzugmaschinen

### Karriere — 4 offene Stellen
Disponent m/w/d (Vollzeit) · LKW-Fahrer CE Sattelzug Fernverkehr ·
LKW-Fahrer Nahverkehr (7,49 t / 12 t) · LKW-Fahrer CE Wechselbrücken Regional-/Fernverkehr

### Neuigkeiten — 9 Beiträge (Mai 2025 bis Juli 2021)
ISO-9001-Audit 2025 · ISO-9001-Audit 2023 · IFS-Audit 2023 · Umzug 2023 ·
Erdbebenhilfe Türkei 2023 · IFS-Audit 2022 · Logistik 4.0 (2021) · IFS-Zertifizierung 2021 · ISO-Zertifizierung 2021

---

## 5. Design-Tokens (gemessen)

| Token | Wert |
|---|---|
| Primär (Rot) | `#d10a11` |
| Rot-Varianten | `#e40316`, `#ff3a2d` |
| Dunkelgrau (Topbar/Headings) | `#3f3f3f` |
| Fließtext | `rgb(75,78,80)` = `#4b4e50` |
| Hellgrau (Karten) | `#e0e0df`, `#c6c6c6` |
| Blau (Akzent/Logo) | `#004e9c` |
| Body-Font | `Heebo`, 14px |
| Heading-Font | `Assistant`, weight 900 |
| Weitere Font-Referenz | `Poppins` |
| Button | bg `#d10a11`, radius `3px`, padding `9px 20px`, 14px |

**Logo:** Rotes „KURT" mit silbernem Z-Blitz, Subline „INTERNATIONALE TRANSPORTE", grauer Schwung.
Gesichert als `assets/source/zkurt_logo_webB.png` (Web) und `kurt-logo-16x16px.png` (Favicon-Quelle).

---

## 6. Formular „Erhalten Sie ein Angebot" (Feldliste)

| Feld | Typ |
|---|---|
| Firma | text |
| E-Mail-Adresse | email |
| Ansprechpartner | text *(live falsch: „Ansprechspartner")* |
| Telefon | tel |
| Ladestelle | text |
| Entladestelle | text |
| Sendungsgewicht | text |
| Maße in m | text |
| Art der Ladung | select |
| Art des Transports | select |
| Ihre Nachricht | textarea |
| reCAPTCHA | — |

Hinweis: „Alle Felder sind Pflichtfelder."

---

## 7. Gesicherte Assets (`assets/source/`)

Logo, Favicon-Quelle, Hero-LKW (`LKW-3-2-scaled.jpg`), LKW auf Brücke, Volvo im Schneefall,
Kühltransport, 12-Tonner, Projektladung, Transportation, Kurt-Transport-Flotte,
Komplettzug Amazon, ISO-9001-Zertifikat, IFS-Progress-Zertifikat, Europakarte.

Bildnachweise laut Impressum: shutterstock, freepik, pixabay, stock.adobe.com.

---

## 8. Hinweis zu REA

Das `/rea`-Skill wurde geladen, der REA-MCP-Server ist in dieser Session jedoch **nicht
registriert**. Ein erster Diagnoseversuch schlug lautlos fehl — Ursache war nicht REA,
sondern ein kaputter Node-Shim auf dem Rechner (siehe `docs/UMGEBUNG.md`). Das Paket
`rea-agents` ist verfuegbar (v6.7.0) und koennte per `setup --client claude_code`
registriert werden.

Fuer dieses Ziel ist REA dennoch nicht das passende Instrument: seine Routen sind Binaries,
ASAR/Electron, APK, Managed Assemblies, Firmware und EVM-Bytecode — eine oeffentliche
WordPress-Seite liefert ihren Quellcode direkt als HTML/CSS aus. Die Analyse oben wurde
daher mit HTTP-Abruf und Browser-DOM-Inspektion erstellt, was hier die vollstaendigere
Rekonstruktionsgrundlage ergibt.
