// Writes the privacy policy (spec T-077) as a plain page with no scripts, so
// it opens anywhere, signed in or not. The words live in src/legal/privacy.ts.

import { CONTACT_EMAIL, SECTIONS, UPDATED, contactLines } from '../src/legal/privacy'

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function linesHtml(lines: string[]): string {
  let out = ''
  let list = false
  for (const line of lines) {
    const item = line.startsWith('- ')
    if (item && !list) out += '<ul>'
    if (!item && list) out += '</ul>'
    list = item
    out += item ? `<li>${escape(line.slice(2))}</li>` : `<p>${escape(line)}</p>`
  }
  return list ? out + '</ul>' : out
}

/** The whole page, with no scripts, so it opens anywhere. */
export function privacyPage(email = CONTACT_EMAIL): string {
  const body = [...SECTIONS, { heading: 'Contact us', lines: contactLines(email) }]
    .map((s) => `<h2>${escape(s.heading)}</h2>${linesHtml(s.lines)}`)
    .join('\n')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy policy · Track Me Fit</title>
<style>
body { max-width: 640px; margin: 0 auto; padding: 16px; font: 16px/1.5 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1c2321; background: #fff; }
h1 { color: #0f7a5c; font-size: 24px; }
h2 { font-size: 18px; margin-top: 24px; }
a { color: #0f7a5c; }
.muted { color: #5b6763; font-size: 14px; }
@media (prefers-color-scheme: dark) { body { color: #e8eeeb; background: #121816; } .muted { color: #9aa8a3; } h1, a { color: #4fd1a5; } }
</style>
</head>
<body>
<h1>Privacy policy</h1>
<p class="muted">Updated on ${escape(UPDATED)}.</p>
${body}
<p><a href="/">Open Track Me Fit</a></p>
</body>
</html>
`
}
