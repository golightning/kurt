# Abnahme vor der Veröffentlichung

Was in der lokalen Prüfung nicht feststellbar ist. Zwei Blöcke, beide offen.

---

## 1. Echtes iPhone mit Safari

Chromium-Emulation deckt Layoutbreiten ab, aber nicht Safaris eigenes Verhalten.
Die folgenden Punkte sind genau die, bei denen WebKit erfahrungsgemäß abweicht.

| Prüfpunkt | Worauf achten |
|---|---|
| Hero-Höhe | `100svh` wird von älteren Safari-Versionen ignoriert. Rutscht der Inhalt unter die Adressleiste? |
| 3D-Marke | WebGL2 ist ab iOS 15 vorhanden. Erscheint sie, oder bleibt der Vektor-Ersatz stehen? Beides ist zulässig — ein leeres Feld nicht. |
| Mobilmenü | Öffnen, schließen, Navigation. `inert` wird erst ab Safari 15.5 unterstützt; in älteren Versionen bleiben die Links im Tab-Fokus. |
| Formular | Alle drei Schritte. Besonders: springt das Layout beim Fokussieren eines Feldes (Safari zoomt bei Schriftgrößen unter 16 px). |
| Bestätigung | Nach dem Absenden muss „Danke — das genügt uns." im Bild stehen. |
| Routengrafik | Ulm links und Thessaloniki rechts vollständig lesbar. |
| Aufliegerzeichnung | Bemaßung lesbar, Zahlen zählen beim Scrollen mit. |
| Scroll-Animationen | Safari behandelt `scroll`-Ereignisse beim Momentum-Scrolling anders. Laufen die Abläufe flüssig oder ruckartig? |
| Reduzierte Bewegung | Einstellungen → Bedienungshilfen → Bewegung reduzieren. Danach müssen alle Inhalte sofort vollständig sichtbar sein. |

**Zu erwartende Abweichung:** Das 3D-Logo beginnt bei 390 × 844 px erst am
unteren Bildrand. Das ist eine Gestaltungsentscheidung, kein Fehler — vor dem
Termin bewusst ansehen und entscheiden, ob es so bleiben soll.

---

## 2. Zielhosting

`dist/` enthält pro Route **zwei** Dateien (`<route>.html` und
`<route>/index.html`), damit der Direktaufruf mit und ohne abschließenden Slash
funktioniert. Lokal geprüft, beim Hoster noch nicht.

| Prüfpunkt | Erwartung |
|---|---|
| `/kontakt` | Kontaktseite, HTTP 200 |
| `/kontakt/` | Kontaktseite, HTTP 200 |
| Neuladen auf `/leistungen` | dieselbe Seite, keine Weiterleitung zur Startseite |
| Gleiches für `/fuhrpark`, `/angebot` | — |
| `/gibtsnicht` | 404-Seite mit **HTTP-Status 404**, nicht 200 |
| `/sitemap.xml`, `/robots.txt` | erreichbar |
| `/og-image.png` | erreichbar (sonst bleibt die Vorschau beim Teilen leer) |

Prüfbefehl:

```sh
for u in / /kontakt /kontakt/ /leistungen /leistungen/ /fuhrpark /angebot /gibtsnicht; do
  curl -s -o /dev/null -w "%{http_code}  $u\n" "https://DOMAIN$u"
done
```

Erwartung: überall 200, nur `/gibtsnicht` liefert 404.

**Konfiguration liegt bei.** `netlify.toml` setzt die 404-Regel, `vercel.json`
und `public/_headers` die Cache-Regeln für die gehashten Dateien. In
`vercel.json` sind `cleanUrls` und `trailingSlash` bewusst **nicht** gesetzt:
beide erzwingen Weiterleitungen, die mit der Doppelablage kollidieren könnten,
und das ließ sich hier nicht nachprüfen. Bei einem anderen Hoster gilt nur eine
Regel: unbekannte Pfade müssen `404.html` mit Status 404 ausliefern, und kein
Catch-all darf vor die vorhandenen Dateien greifen.

---

## Nicht Teil der Abnahme

Bewusste Lücken der Demo, keine Fehler: Impressum und Datenschutz fehlen, das
Formular versendet nichts, acht der dreizehn Seiten der Live-Site sind nicht
nachgebaut. Siehe `docs/PITCH.md`, Abschnitt zum Umfang.

Inhaltlich offen und vom Inhaber zu klären: die aktuellen Nachweise für
ISO 27001 und IFS Progress Logistics sowie die Zusage zur Reaktionszeit.
