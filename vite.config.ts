import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Unter GitHub Pages liegt die Seite in einem Unterpfad (/kurt/), nicht an der
// Wurzel. Ohne passende `base` zeigen alle Asset-Pfade ins Leere und die Seite
// bleibt weiss. BASE_PATH setzt das fuer den Pages-Build; ohne die Variable
// bleibt es bei '/', wie es fuer eine eigene Domain richtig ist.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // Vite preloads a lazy chunk's dependencies by default, which would pull the
    // 248 KB three.js bundle into the initial document anyway and undo the split.
    modulePreload: {
      resolveDependencies: (_url: string, deps: string[]) =>
        deps.filter((d) => !d.includes('three-')),
    },
    rollupOptions: {
      output: {
        // Keep the WebGL stack out of the entry chunk: only the hero needs it,
        // and every other route should not pay for it.
        manualChunks(id: string) {
          if (/node_modules\/(three|@react-three)\//.test(id)) return 'three'
          return undefined
        },
      },
    },
  },
})
