// Erzeugt Farbvarianten der vermessenen Z-Marke für die Design-Entwürfe.
// Gleiche Konturquelle wie 3D-Modell, Logo und Favicon.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const c = JSON.parse(readFileSync('.img2threejs/contours.json', 'utf8'))
const S = 1000
const toPath = (p) => 'M' + p.map(([x, y]) => `${(x * S).toFixed(1)} ${(-y * S).toFixed(1)}`).join(' L ') + ' Z'
const red = toPath(c.red.path)
const grey = toPath(c.grey.path)

const all = [...c.red.path, ...c.grey.path]
const xs = all.map((p) => p[0] * S)
const ys = all.map((p) => -p[1] * S)
const pad = 10
const x0 = Math.min(...xs) - pad
const x1 = Math.max(...xs) + pad
const y0 = Math.min(...ys) - pad
const y1 = Math.max(...ys) + pad
const vb = `${x0.toFixed(1)} ${y0.toFixed(1)} ${(x1 - x0).toFixed(1)} ${(y1 - y0).toFixed(1)}`

const svg = (markFill, ribbonFill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">` +
  `<path d="${grey}" fill="${ribbonFill}"/>` +
  `<path d="${red}" fill="${markFill}"/></svg>`

mkdirSync('public/entwuerfe', { recursive: true })
const variants = {
  'mark-brand.svg': svg('#e20613', '#708296'),
  'mark-white.svg': svg('#ffffff', 'rgba(255,255,255,0.45)'),
  'mark-black.svg': svg('#111111', 'rgba(17,17,17,0.40)'),
  'mark-red-solid.svg': svg('#e20613', '#e20613'),
}
for (const [name, body] of Object.entries(variants)) {
  writeFileSync(`public/entwuerfe/${name}`, body)
}
console.log(`${Object.keys(variants).length} Markenvarianten geschrieben, viewBox "${vb}"`)
