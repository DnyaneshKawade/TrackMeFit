// Writes the privacy policy (spec T-077) as a plain page with no scripts, so
// it opens anywhere, signed in or not. The words live in src/legal/privacy.ts.

import { CONTACT_EMAIL, SECTIONS, UPDATED, contactLines, type Section } from '../src/legal/privacy'
import { DELETE_SECTIONS } from '../src/legal/deleteAccount'

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

const sectionsHtml = (sections: Section[]) => sections.map((s) => `<h2>${escape(s.heading)}</h2>${linesHtml(s.lines)}`).join('\n')

/** A plain page with no scripts, so it opens anywhere. */
function page(title: string, intro: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} · Track Me Fit</title>
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
<h1>${escape(title)}</h1>
${intro}
${body}
<p><a href="/">Open Track Me Fit</a></p>
</body>
</html>
`
}

/** The privacy policy (T-077). */
export function privacyPage(email = CONTACT_EMAIL): string {
  return page('Privacy policy', `<p class="muted">Updated on ${escape(UPDATED)}.</p>`, sectionsHtml([...SECTIONS, { heading: 'Contact us', lines: contactLines(email) }]))
}

/** How to delete an account, with or without the app (T-098). */
export function deletePage(): string {
  return page('Delete your account', '<p>You can delete your Track Me Fit account and all its data at any time.</p>', sectionsHtml(DELETE_SECTIONS) + '\n<p><a href="/privacy.html">Read our privacy policy</a></p>')
}
