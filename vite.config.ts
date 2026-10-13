import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildId, stampServiceWorker } from './build/swStamp'

// After a production build, name the offline cache after this build so the
// service worker drops the previous deploy's files.
function stampSw(): Plugin {
  let outDir = 'dist'
  let files: string[] = []
  return {
    name: 'tmf-stamp-sw',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir
    },
    generateBundle(_, bundle) {
      files = Object.keys(bundle)
    },
    closeBundle() {
      const path = resolve(outDir, 'sw.js')
      writeFileSync(path, stampServiceWorker(readFileSync(path, 'utf8'), buildId(files)))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stampSw()],
})
