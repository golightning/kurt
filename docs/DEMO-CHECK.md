# Demo-Check — 21.10.2026

**Urteil: gestalterisch weitgehend vorzeigbar, für eine störungsfreie Desktop- und Mobile-Demo noch nicht ganz fertig.** Vor dem Termin sollten die Zertifikatsaussagen, die beiden Formularfehler und die mobile Routengrafik korrigiert werden. Die Vorschau muss außerdem direkte Unterseiten korrekt ausliefern.

Geprüft wurde der lokale Produktionsbuild mit `npm run build` und `npm run preview`, nicht eine veröffentlichte Demo-URL. Die Website wurde im Rahmen dieses Checks nicht verändert.

## Umfang und positive Ergebnisse

- Alle fünf Seiten bei 320, 360, 390, 768, 1024, 1280 und 1440 Pixel Breite: 35 Kombinationen in Chromium, einschließlich Scrollen bis zum Seitenende.
- Produktionsbuild einschließlich TypeScript und Prerendering erfolgreich. Hinweis auf den großen, nachgeladenen Three.js-Chunk; kein Buildfehler.
- Kein horizontaler Seitenüberlauf, keine defekten Bilder und keine fehlgeschlagenen Ressourcenanfragen in diesen Durchläufen. Alle `.reveal`-Inhalte wurden nach dem Scrollen sichtbar.
- Klare gestalterische Linie; Desktop-Hero, Bilder, Seitenstruktur und wesentliche Handlungsbuttons funktionieren. Mobile Grundlayouts passen auch bei 320 Pixeln.
- Formular auf Desktop, 390 und 320 Pixeln vollständig durchgespielt: Pflichtfeld- und E-Mail-Prüfung, Zurück mit Datenerhalt, Abschluss und Zurücksetzen funktionieren. Keine Formularübertragung beobachtet.
- Mobiles Menü öffnet und schließt per Button; Navigation zu einer anderen Seite schließt es nach dem Routenwechsel.
- Reduzierte Bewegung geprüft: statische Marke und fertige grafische Zustände verfügbar.
- Axe-Prüfung mit WCAG-A/AA-Regeln auf allen fünf Seiten bei 1440 und 390 Pixeln: Kontrastverletzungen; keine weiteren automatisch gemeldeten Regelverletzungen. Dies ist kein vollständiges Barrierefreiheitsaudit.

Grenzen: Mobile wurde im Browser emuliert, nicht auf einem physischen iPhone oder Android-Gerät. Safari/WebKit, reale Mobilfunkleistung und öffentliches Hosting sind nicht geprüft. Aktuelle Zertifikatsgültigkeit wurde nicht extern neu recherchiert.

## Vor der Vorführung beheben

### 1. Zertifizierungsdarstellung widerspricht dem vorhandenen Nachweisstand

**Priorität: hoch · Desktop und Mobile.**

`src/data/site.ts:48` enthält für IFS ausdrücklich `validUntil: '2025-05-09'`. Sichtbar ist nur das Assessment-Datum von 2024; im Footer steht IFS dennoch unter „Zertifiziert“, die Startseitenbeschreibung behauptet „IFS zertifiziert“. ISO 27001 steht ebenfalls unter „Zertifiziert“ und in der Meta-Description, obwohl der Datensatz selbst den fehlenden aktuellen Nachweis dokumentiert.

Zusätzlich verspricht der Zertifikatsabschnitt „Jedes Zertifikat mit Geltungsbereich, Registriernummer und Laufzeit“, was für den dargestellten ISO-27001-Eintrag nicht zutrifft. Das ist im Gespräch unmittelbar nachprüfbar und schwächt die Überschrift „Geprüft, nicht behauptet“.

**Empfehlung:** Aktuell belegte Zertifikate von historischen bzw. ungeklärten Nachweisen trennen; Status konsistent in Startseite, Kontakt, Footer, Meta-Description und strukturierten Daten führen. Aus fehlenden Nachweisen lässt sich nicht ableiten, dass das Unternehmen heute definitiv unzertifiziert ist.

Quellen: `src/data/site.ts:40–65`, `src/pages/Home.tsx` (Zertifikate), `src/components/Footer.tsx` (Zertifiziert), `src/pages/Kontakt.tsx`, `src/seo/meta.ts:17`.

### 2. Formular zeigt Fehler bereits beim ersten Betreten von Schritt 3

**Priorität: hoch · Desktop und Mobile.**

Reproduktion: Strecke korrekt ausfüllen → Weiter → Gewicht und Ladungsart ausfüllen → Weiter. Sofort stehen bei Firma und Ansprechpartner „Bitte angeben“ sowie bei E-Mail „Gültige E-Mail-Adresse nötig“, ohne dass der Nutzer diese Felder zuvor gesehen oder abgeschickt hat.

Beim Wechsel wird der bisherige Weiter-Button zum Submit-Button. Das beobachtete Verhalten passt dazu, dass derselbe Klick bereits den Submit-Handler und damit `markTouched()` für Schritt 3 auslöst.

**Empfehlung:** Weiter- und Absenden-Aktion mit getrennten Button-Identitäten und abgesichertem Submit-Verhalten behandeln. Beim erstmaligen Eintritt müssen die Kontaktfelder neutral erscheinen.

Quelle: `src/pages/Angebot.tsx:203–220`.

[Screenshot: Fehler beim ersten Eintritt in Schritt 3](demo-check/390-contact-premature-errors.png)

### 3. Formularabschluss lässt die Danke-Überschrift außerhalb des Bildes

**Priorität: hoch · besonders Mobile.**

Nach gültigem Absenden wird der Inhalt ausgetauscht, die alte Scrollposition bleibt jedoch bestehen. Gemessen bei 390 Pixeln: `scrollY = 546`, Oberkante der Danke-Überschrift bei `−333 px`. Im sichtbaren Bereich stehen der Demo-Hinweis und bereits große Teile des Footers. Auf Desktop liegt die Überschrift ebenfalls oberhalb des sichtbaren Bereichs.

**Empfehlung:** Beim Abschluss zum Bestätigungsbereich scrollen und den Fokus auf dessen Überschrift setzen; auch beim Zurücksetzen einen sinnvollen Einstieg herstellen.

Quelle: `src/pages/Angebot.tsx:70–99` und Submit-Handler.

[Screenshot unmittelbar nach dem Absenden, 390 Pixel](demo-check/390-after-submit.png)

### 4. Routengrafik schneidet die Ulmer Adresse ab

**Priorität: mittel · Mobile und Tablet.**

Die Beschriftung unter Ulm wird um ihren Mittelpunkt bei 3 % der Grafikbreite positioniert. Bei 390 Pixeln beginnt die Adresszeile bei etwa `x = −29 px`; bei 768 Pixeln bei `−17 px`. Der umgebende Abschnitt schneidet den überstehenden Text ab. Daher entsteht kein horizontaler Scrollbalken, obwohl Inhalt fehlt.

**Empfehlung:** Randbeschriftungen nach innen ausrichten oder für kleine Ansichten eine eigene Beschriftungsanordnung verwenden.

Quelle: `src/components/RouteLine.tsx:153–179`.

[Screenshot der mobilen Routengrafik](demo-check/390-route-detail.png)

### 5. Direkte Unterseiten liefern lokal zuerst das falsche HTML

**Priorität: hoch für die verwendete Vorschau; Verhalten des späteren Hostings offen.**

Unter `npm run preview` liefert `/kontakt` das Startseiten-HTML mit der Überschrift „Ganzheitliche Logistiklösungen“. Der Client erwartet die Kontaktseite und meldet React-Fehler #418, bevor er den Inhalt neu aufbaut. Dasselbe passiert bei `/leistungen`, `/fuhrpark` und `/angebot`.

Mit abschließendem Slash, beispielsweise `/kontakt/`, kommt das richtige vorgerenderte HTML; auf allen vier Unterseiten wurden dann keine React-Laufzeitfehler beobachtet. Die Dateien liegen unter `dist/<route>/index.html`, interne Links und Sitemap verwenden jedoch Pfade ohne abschließenden Slash.

**Empfehlung:** Routing und Serverauslieferung für direkte Aufrufe aufeinander abstimmen. Für eine sofortige lokale Vorführung direkte Einstiege mit abschließendem Slash verwenden. Ein Hosting-Test muss später beide URL-Varianten abdecken.

Quellen: `scripts/prerender.mjs`, `src/data/site.ts` (Navigation), `src/App.tsx`.

## Weitere Verbesserungen

### Lesbarkeit und Tastaturbedienung

- `text-faint` (`#6b6b78`) auf `#08080a`: gemessener Kontrast **3,81:1**; kleine rote Beschriftungen (`#e20613`) auf demselben Hintergrund: **4,06:1**. Axe erwartet für diese kleinen Texte **4,5:1**. Betroffen sind unter anderem Zertifikatsdaten, Formularhinweise, Leistungsmerkmale und Kontaktlabels. Textfarben gezielt aufhellen; das Markenrot muss dafür nicht überall geändert werden. Quelle: `src/index.css`.
- Das geschlossene mobile Menü hat nur Höhe null; seine Links bleiben per Tab erreichbar. Außerdem schließt Escape das Menü nicht, und ein Klick auf die bereits aktive Seite lässt es offen. Normale Navigation zu einer anderen Route schließt es korrekt. Quelle: `src/components/Header.tsx:96–121`.
- Die erste Auswahl-Schaltfläche jeder Chipgruppe erhält den umgebenden Gruppentext als zugänglichen Namen, weil alle Buttons in einem `label` stehen. Beispielsweise ist der erste Transportbutton nicht unter seinem sichtbaren Text „Komplettladung (FTL)“ erreichbar. Hier passen `fieldset` und `legend` besser. Quelle: `src/pages/Angebot.tsx`, `Field` und `ChipGroup`.

### Präsentation und Inhalte

- Zertifikatsscans sind nur 80 Pixel (Mobile) bzw. 112 Pixel (Desktop) breit und nicht anklickbar. Für „nachprüfbare Nachweise“ sollte ein Klick eine lesbare Fassung öffnen.
- Das 3D-Logo beginnt bei 390 × 844 Pixeln erst am unteren Bildschirmrand. Die mobile Seite ist ordentlich lesbar, hat aber nicht denselben sofortigen Markeneffekt wie Desktop. Dies ist eine Gestaltungsentscheidung, kein Funktionsfehler.
- Die kleine Beschriftung der Aufliegerzeichnung skaliert auf Mobile sehr weit herunter. Die darunterstehenden Kennzahlen sind dagegen gut lesbar.
- „Vier Angaben“ im Formular ist verkürzt: Zusätzlich zur Strecke, dem Gewicht und der Ladungsart sind Transportart, Firma, Ansprechpartner und E-Mail verpflichtend. Auch Zusagen wie ein verbindliches Angebot innerhalb von 24 Stunden sollten vom Inhaber bestätigt werden.
- Im Footer steht „ISO 9001“ zweimal ohne Unterscheidung der Gesellschaften. Die beiden Einträge nutzen dort und auf der Kontaktseite zudem denselben React-Key `c.code`; eindeutige Kennungen verwenden.
- `docs/PITCH.md` enthält veraltete Demo-Angaben: etwa 7.580 Bytes Startseiten-HTML gegenüber inzwischen rund 44 KB laut Build sowie „vollständige“ Open-Graph-Tags, obwohl `og:image` fehlt. Zahlen und Funktionsbehauptungen vor Verwendung im Verkaufsgespräch aktualisieren.

### Robustheit außerhalb der normalen Demo

- Ohne JavaScript stehen die Kennzahlen bei `0,00 m`, `0,00 m` und `0`; 14 Zeilen bleiben mit Opazität 0,18 gedimmt. Der behauptete vollständig lesbare statische Fallback ist daher nicht durchgehend umgesetzt. Quellen: `ScrollCounter.tsx`, `StackReveal.tsx`, `useScrollProgress.ts`.
- Unbekannte Pfade zeigen die Startseite statt einer eigenen Nicht-gefunden-Seite. Für die geführte Demo nebensächlich, für die spätere Veröffentlichung prüfen.
- Impressum, Datenschutz und echter Formularversand sind ausdrücklich als Demo-Lücken gekennzeichnet. Für diese Präsentationsprüfung wurden sie nicht als unerwartete Defekte gewertet.

## Belege

[Desktop-Einstieg](demo-check/1440-home-top.png) · [Mobiler Einstieg](demo-check/390-home-top.png) · [Mobiles Menü bei 320 Pixeln](demo-check/320-menu.png)

Ausführliche temporäre Browserdaten und Prüfscripte dieses Laufs liegen unter `/tmp/kurt-demo-audit/`. Dauerhafte Screenshots der wesentlichen Befunde sind im Ordner `docs/demo-check/` abgelegt.
