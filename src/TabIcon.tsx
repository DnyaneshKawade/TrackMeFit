// Line icons for the bottom tabs (specs T-101c, T-101d). Drawn inline so they follow
// the text colour in light and dark.

const PATHS = {
  food: <><path d="M4 11l8-6 8 6" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5h4v5" /></>,
  training: <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" />,
  progress: <path d="M4 18l5-6 4 3 7-8" />,
  clients: <><circle cx="9" cy="9" r="3.5" /><path d="M3 19c.8-3 3.2-4 6-4s5.2 1 6 4" /><path d="M16 5.5a3.5 3.5 0 0 1 0 7" /><path d="M18 15c1.6.5 2.6 1.8 3 4" /></>,
  me: <><circle cx="12" cy="9" r="4" /><path d="M5 20c1-4 4-5 7-5s6 1 7 5" /></>,
  admin: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />,
}

export function TabIcon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}
