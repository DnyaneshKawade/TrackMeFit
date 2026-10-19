import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/dm-sans/wght.css'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './registerSw'
import { applyTheme, readTheme } from './settings/theme'

// Set the look first, so the page never flashes the wrong colours.
applyTheme(readTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerServiceWorker()
