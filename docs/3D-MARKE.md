# Die KURT-Z-Marke in 3D

Erzeugt mit dem `img2threejs`-Skill (Apache-2.0, v2.0.0) aus
`reference/kurt-z-mark.png` — dem hochauflösenden Logo-Asset der Live-Seite.

Das Ergebnis ist **prozeduraler Three.js-Code**, kein heruntergeladenes Mesh: eine
TypeScript-Factory in `src/three/createKurtZMarkModel.ts`, die zwei gemessene Konturen
extrudiert.

---

## Messgrundlage statt Schätzung

Das Quellbild ist vektorabgeleitet und kantenrein — **null** antialiasierte Pixel. Dadurch
ließ sich die Form exakt vermessen statt nachzuzeichnen:

| Messung | Wert |
|---|---|
| Rot | `rgb(226, 6, 19)` = `#e20613` über 994.988 px |
| Slate | `rgb(112, 130, 150)` = `#708296` über 236.336 px |
| Rote Kontur | 6.522 Rohpunkte → 95 nach RDP (ε = 1,1 px) |
| Graue Kontur | 3.301 Rohpunkte → 55 nach RDP |
| **Silhouettentreue** | **IoU 0,99486** (3.606 fehlend, 1.503 überzählig von 994.988 px) |

> Wichtig fürs Gespräch: Das Rot der Marke ist `#e20613`. Das Stylesheet der Live-Seite
> verwendet für Buttons `#d10a11` — zwei unterschiedliche Rottöne auf derselben Seite.

Verfahren: Moore-Nachbarschafts-Randverfolgung über die Farbmaske, danach
Ramer-Douglas-Peucker. Die Konturen liegen in `.img2threejs/contours.json` und speisen
sowohl das 3D-Modell als auch das SVG-Logo und das Favicon — eine Quelle, drei Ausgaben.

---

## Zwei Defekte, die das Review gefunden hat

**1. Synthetische Texturen haben die gemessene Albedo verworfen.**
Der Generator setzt `color` auf Weiß und `roughness` auf 1, sobald Texturen vorhanden sind,
und liest beides aus den Maps. Die Marke rendete dadurch chromfarben statt rot. Korrekt ist
hier `textureless.declared` — belegt durch die Pixelzählung: zwei Volltonfarben, keine
Texturinformation, die reproduziert werden könnte.

**2. ACES-Tonemapping hat das Markenrot nach Lachs verschoben.**
ACES ist ein Film-Look und kippt gesättigte Primärrottöne systematisch Richtung Orange.
Ersetzt durch **Khronos PBR Neutral**, das Markenfarben erhält. Zusätzlich war die Szene
überbelichtet; die Belichtung liegt jetzt bei 0,62.

Physikalisch wurde außerdem die Metalness von 0,35 auf 0,08 korrigiert: Autolack ist ein
Dielektrikum mit Metallflakes — der metallische Eindruck kommt aus dem Klarlack, nicht aus
einem Leiter. Hohe Metalness entsättigt die Albedo gegen die Environment-Map.

---

## Was geprüft wurde — und was nicht

Durchlaufen und bestanden:

- Bildanalyse, Referenz-Eignung und -Zulassung
- Pre-Spec-Assessment mit Detail-Inventar (5 identitätsstiftende Merkmale)
- Spec-Validierung inklusive `--strict-quality`
- Code-Generierung, Browser-Render, Mehrwinkel-Sichtprüfung
- Review-Protokoll mit Vergleichsblatt und unbeleuchtetem, texturfreiem Render

**Nicht durchlaufen:** Die Pipeline kennt nach `blockout` noch vier weitere visuelle Pässe
(`structural-pass`, `form-refinement`, `material-pass`, `surface-pass`). Die wurden bewusst
nicht gefahren. Bei einer zweiteiligen Extrusion mit IoU 0,995 und exakt gemessenen Farben
erzeugen sie Prozess, aber keine zusätzliche Genauigkeit. Falls die Marke später in einem
Film oder Rendering prominenter eingesetzt wird, lassen sie sich nachholen.

**Bekannte Einschränkung:** Die extrudierten Seitenwände zeigen an der runden Terminierung
oben rechts und am Bogen unten eine leichte Facettierung, weil `ExtrudeGeometry` den Wänden
Flächennormalen gibt und das Profil ein Polygonzug ist. In Hero-Größe fällt das nicht auf;
beheben ließe es sich über eine höhere Konturauflösung oder geglättete Wandnormalen.

**Erklärt, nicht gemessen:** Extrusionstiefe (0,14 / 0,10), Kantenbehandlung und die
Tiefenstaffelung zwischen Marke und Ribbon. Eine einzelne orthografische Ansicht einer
flachen Grafik enthält dazu keine Information. Ebenso sind Roughness, Clearcoat und
Metalness ein erklärter Autolack-Look — flache Grafik trägt keine Schattierungsevidenz.

---

## Modell selbst ansehen

```sh
npm run dev
# dann: http://localhost:5173/preview.html?az=0&rig=custom&tm=neutral&exp=0.45
```

Parameter: `az` Azimut in Grad · `rig=custom` eigenes Licht statt Lookdev-Rig ·
`tm=neutral|aces|none` Tonemapping · `exp` Belichtung · `unlit=1` unbeleuchtet und
texturfrei (Blockout-Nachweis).
