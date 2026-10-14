import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const ROOT = process.cwd()
const SOURCE_DIRECTORIES = ['app', 'lib', 'components', 'contexts', 'hooks', 'scripts']

function collectSourceFiles(directory: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(directory)
  } catch {
    return []
  }

  return entries.flatMap((entry) => {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) return collectSourceFiles(path)
    return /\.(ts|tsx|js|mjs|cjs)$/.test(entry) && !/\.test\./.test(entry) ? [path] : []
  })
}

test('application code never uses interactive transactions unsupported by neon-http', () => {
  const offenders = SOURCE_DIRECTORIES
    .flatMap((directory) => collectSourceFiles(join(ROOT, directory)))
    .filter((file) => /\.transaction\(\s*(async\s*)?\(?\s*\w*\s*\)?\s*=>/.test(readFileSync(file, 'utf8')))
    .map((file) => file.slice(ROOT.length + 1))

  assert.deepEqual(offenders, [], 'Use db.batch([...]) for atomic writes with the Neon HTTP driver')
})
