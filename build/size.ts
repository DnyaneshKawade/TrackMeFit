import { measure, overBudget } from './checkSize.ts'

const files = measure('dist/assets')
for (const f of files) console.log(`${f.name.padEnd(36)} ${f.gzipKb.toFixed(1)} KB gzip`)
const problems = overBudget(files)
if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log('All files within budget.')
