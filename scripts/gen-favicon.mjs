import { readFileSync, writeFileSync } from 'node:fs'

const c = JSON.parse(readFileSync('.img2threejs/contours.json', 'utf8'))
const S = 1000
const toPath = (p) => 'M' + p.map(([x, y]) => `${(x * S).toFixed(1)} ${(-y * S).toFixed(1)}`).join(' L ') + ' Z'

const all = [...c.red.path, ...c.grey.path]
const xs = all.map((p) => p[0] * S)
const ys = all.map((p) => -p[1] * S)
const pad = 30
const x0 = Math.min(...xs) - pad
const x1 = Math.max(...xs) + pad
const y0 = Math.min(...ys) - pad
const y1 = Math.max(...ys) + pad

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${(x1 - x0).toFixed(1)} ${(y1 - y0).toFixed(1)}">` +
  `<path d="${toPath(c.grey.path)}" fill="#708296"/>` +
  `<path d="${toPath(c.red.path)}" fill="#e20613"/>` +
  `</svg>`

writeFileSync('public/favicon.svg', svg)
console.log(`favicon.svg written — ${svg.length} bytes`)
