# Gesprächsleitfaden: KURT Internationale Transporte

Alle Zahlen hier sind **gemessen**, nicht geschätzt. Quellen: `docs/ANALYSE.md` für die
Ist-Seite, der Build-Output dieses Projekts für die Demo.

---

## 1. Der Einstieg: nicht über Optik reden

Ein Inhaber, der seine Seite seit Jahren so kennt, verteidigt sie, sobald man sie hässlich
nennt. Über Zahlen lässt sich dagegen schlecht streiten.

> „Ihre Seite lädt beim ersten Aufruf rund 10 MB an Bildern. Ein einzelnes Ihrer
> Zertifikatsbilder ist 2,7 MB groß — das ist mehr als eine komplette moderne Website.
> Auf dem Handy im Funkloch sieht ein Kunde erst mal nichts."

---

## 2. Die belastbaren Befunde

### Gewicht und Tempo

| | Ist-Seite | Demo |
|---|---|---|
| HTML, erste Anfrage | **136.243 Bytes** (unkomprimiert ausgeliefert) | 47.294 Bytes roh, **9.688 Bytes gzip** |
| HTML-Komprimierung | **keine** (mit und ohne `Accept-Encoding: gzip` identisch) | gzip |
| Bilder gesamt (Originale) | **9,87 MB** | 0,55 MB (−94 %) |
| Größtes Einzelbild | 2.697 KB JPEG | 116 KB AVIF (−96 %) |
| Bildformate | nur JPEG/PNG, kein `srcset` | AVIF + WebP, responsive |
| Initiale Übertragung Startseite | — | **109 KB** (HTML + CSS + JS, gzip) |

Das 3D-Hero (250 KB gzip) liegt in einem eigenen Chunk, der weder als Script eingebunden
noch vorgeladen wird — geprüft im ausgelieferten `dist/index.html`. Er wird erst nach dem
ersten Paint angefordert, und nur auf Geräten mit WebGL2 ohne `prefers-reduced-motion`.
Das HTML der Demo ist größer als ursprünglich notiert, weil die Seite seither Inhalte
dazubekommen hat; entscheidend ist der gzip-Wert, den die Live-Seite gar nicht nutzt.

### Auffindbarkeit bei Google

| | Ist-Seite | Demo |
|---|---|---|
| `<meta name="description">` | **fehlt auf der Startseite** | je Seite individuell |
| Sitemap | **fehlt** (`/sitemap.xml` liefert eine 404-Seite) | `sitemap.xml` |
| `robots.txt` | WordPress-Standard, kein Sitemap-Verweis | mit Sitemap-Verweis |
| Open-Graph-Tags | **keine** → kein Vorschaubild beim Teilen | Titel, Beschreibung, URL und `og:image` (1200×630) |
| LocalBusiness-Schema | **keines** | `MovingCompany` mit Adresse, Geo-Koordinaten, Öffnungszeiten, Zertifikaten (`hasCredential`) und Sponsoring |
| `<h1>` auf der Startseite | **keines** (beginnt bei H4) | auf jeder Seite genau eines |
| Text auf der Zertifizierungsseite | **0 Wörter** (reine Bildergalerie) | — |

Für ein regional tätiges Unternehmen ist das fehlende LocalBusiness-Schema der teuerste
Punkt: Google bekommt nirgends maschinenlesbar gesagt, dass es sich um eine Spedition in
Ulm mit diesen Öffnungszeiten handelt.

### Rechtliches — vorsichtig ansprechen

Das Impressum nennt **keine USt-IdNr. und keine HRB-Nummer**. § 5 TMG verlangt beides,
soweit vorhanden. Die Copyright-Zeile steht auf **2021**.

Das ist kein Verkaufsargument zum Draufhauen, sondern ein Hinweis unter Kollegen. Genau so
sollte er auch vorgetragen werden.

### Technische Aktualität

Slider Revolution **6.3.8** stammt aus 2020. Das Plugin hat eine bekannte CVE-Historie;
veraltete Versionen gehören zu den häufigsten Einfallstoren bei WordPress-Seiten.

### Tippfehler im Live-Text

„Logisitiklösungen", „präsise", „Emiisionen", „Kraftstoffverbrqauch", „drei Jahrzenten",
„Ergenis", „Nicht ist uns so wichtig" und — besonders unangenehm, weil im Formular —
„Ansprechspartner".

In der Demo sind sie korrigiert. Das ist ein guter, unaufdringlicher Aufhänger: man hat
sich die Seite wirklich angesehen.

---

## 3. Der Moment, der den Unterschied macht

Die Startseite öffnen. Das **eigene Z des Kunden** steht als 3D-Objekt im Raum und folgt
langsam dem Mauszeiger.

Dann der Satz, der das Gespräch dreht:

> „Das ist kein Stock-Objekt und nichts Nachgebautes. Wir haben Ihr Logo vermessen und als
> Vektor neu aufgebaut — die Silhouette stimmt zu 99,5 % mit Ihrem Original überein. Ihr
> jetziges Web-Logo ist eine 334 × 104 Pixel große PNG-Datei; auf jedem modernen Bildschirm
> ist die sichtbar unscharf. Die neue Fassung ist 3,4 KB groß und in jeder Größe gestochen
> scharf — vom Favicon bis zur LKW-Plane."

Detail als Beleg der Sorgfalt: Das Rot seiner Marke ist `#e20613`, die Buttons seiner Seite
verwenden aber `#d10a11`. Zwei verschiedene Rottöne auf derselben Website.

---

## 4. Was die Demo abdeckt — und was nicht

**Enthalten:** Startseite, Leistungen (5 Branchenlösungen), Fuhrpark (6 Fahrzeugtypen),
mehrstufige Angebotsanfrage, Kontakt.

**Nicht enthalten:** Unternehmen, Zertifizierungen, Karriere, Neuigkeiten, Logistik,
Impressum, Datenschutz. Das Formular versendet nichts.

Diese Lücken offen ansprechen. „Fünf Seiten, damit Sie sehen, wohin es geht" wirkt
souveräner als die Hoffnung, dass niemand auf einen toten Link klickt.

---

## 5. Naheliegende Einwände

**„Was kostet mich das im Unterhalt?"**
Statisches HTML, keine Datenbank, keine Plugin-Updates. Hosting im einstelligen
Euro-Bereich. Die jetzige Seite braucht regelmäßige WordPress-, Theme- und
Plugin-Aktualisierungen — sonst wiederholt sich der Slider-Revolution-Fall.

**„Meine Mitarbeiter können WordPress bedienen."**
Berechtigt. Die Inhalte liegen hier in einer einzigen Datei, nicht in einer Oberfläche. Wenn
redaktionelle Pflege gebraucht wird, lässt sich ein Headless-CMS ergänzen — das sollte man
zusagen, statt es wegzureden.

**„Brauche ich 3D?"**
Nein. Es ist der Aufhänger, nicht das Produkt. Die messbaren Vorteile sind Ladezeit,
Auffindbarkeit und ein Formular, das tatsächlich zu einer Anfrage führt.

---

## 6. Offene Fragen an den Inhaber

**Alles liegt nur als Bild vor.** Dreizehn Bilder der Live-Seite haben ein leeres
alt-Attribut, darunter die SSV-Partnerschaft im Footer und saemtliche
Zertifikatsscans auf /unsere-zertifizierungen/. Fuer Google und fuer
Screenreader existieren diese Belege schlicht nicht — die Zertifizierungsseite
enthaelt null Woerter Text.

Das ist das konkreteste Argument im ganzen Gespraech, weil es sich in zwei
Zeilen zeigen laesst:

    live: <img src="ssv-grafik-neu.png" alt="">
    Demo: Ueberschrift + Fliesstext + alt-Attribut + JSON-LD sponsor/SportsTeam

In der Demo tragen die Zertifikate jetzt ihre echten Daten aus den Scans:
Geltungsbereich, Registriernummer, ausstellende Stelle und Laufzeit, dazu
maschinenlesbar als hasCredential.

**Offene Nachweise: ISO 27001 und IFS.** Zwei Angaben sind nicht durch einen
heute gueltigen Nachweis gedeckt:

- **ISO 27001** — nur in einer Neuigkeit von 2021 erwaehnt, kein
  Zertifikatsscan, in den aktuellen Audit-Meldungen (Mai 2025, "doppeltes
  ISO-9001-Audit") nicht genannt.
- **IFS Progress Logistics** — der Scan liegt vor, seine Bestaetigung lief am
  **09.05.2025** aus. Das Assessment vom Maerz 2024 belegt keine heutige
  Gueltigkeit.

In der Demo erscheinen beide als historische Nachweise mit offenem Status
("Nachweis liegt uns nicht vor" bzw. "Folgebestaetigung ausstehend"). Sie
stehen nicht im Footer unter "Zertifiziert", nicht in der Meta-Description und
nicht im strukturierten `hasCredential`. Nur die beiden ISO-9001-Zertifikate
(gueltig bis 01.05.2028) werden als laufend gefuehrt.

**Wortlaut fuer die Rueckfrage:**

> Bitte senden Sie uns die aktuellen Nachweise fuer ISO 27001 und IFS Progress
> Logistics. Uns liegen dafuer bisher nur die Erwaehnung von 2021 beziehungsweise
> das Assessment von 2024 vor.

Sobald die Nachweise vorliegen: `status` auf `belegt`, `renewalOpen` entfernen
und `validUntil` setzen — Footer, Meta-Description und strukturierte Daten
ziehen automatisch nach, weil alle `isCurrentlyCertified()` verwenden.

Im Gespraech ist das keine Schwaeche, sondern der Beleg fuer die Arbeitsweise:
auf der heutigen Seite steht der abgelaufene ISO-Scan von 2023 unkommentiert
neben dem gueltigen, und niemandem faellt es auf, weil alles nur Bilder sind.

**Veraltete Scans.** Das ISO-9001-Zertifikat von 2023 (gueltig bis 26.05.2024)
liegt noch auf der Seite, obwohl das Nachfolgezertifikat bis 2028 laeuft. Zeigt,
dass die Seite nicht gepflegt wird.
