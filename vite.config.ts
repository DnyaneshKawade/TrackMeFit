import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildId, stampServiceWorker } from './build/swStamp'
import { deletePage, privacyPage } from './build/privacyPage'

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

// Writes the privacy policy as a plain page at /privacy.html (T-077), and
// how to delete an account at /delete-account.html (T-098).
function privacy(): Plugin {
  let outDir = 'dist'
  return {
    name: 'tmf-privacy',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir
    },
    closeBundle() {
      writeFileSync(resolve(outDir, 'privacy.html'), privacyPage())
      writeFileSync(resolve(outDir, 'delete-account.html'), deletePage())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stampSw(), privacy()],
})
