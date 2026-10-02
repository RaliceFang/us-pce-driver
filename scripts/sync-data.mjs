import { mkdir, copyFile, readdir } from 'node:fs/promises'
await mkdir('public/data', { recursive: true })
for (const name of await readdir('web/data')) {
  if (name.endsWith('.csv') || name.endsWith('.json')) await copyFile(`web/data/${name}`, `public/data/${name}`)
}
