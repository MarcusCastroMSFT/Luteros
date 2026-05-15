import { readFileSync } from 'fs'

const text = readFileSync('C:/Luteros/warnings.txt', 'utf8')
const lines = text.split('\n')

let currentFile = ''
const fixable = ['no-unused-vars', 'exhaustive-deps', 'anonymous-default-export', 'eslint-disable']

for (const line of lines) {
  if (line.match(/^C:\\/) ) {
    currentFile = line.trim().replace('C:\\Luteros\\', '').replace(/\\/g, '/')
  } else if (fixable.some(r => line.includes(r))) {
    const m = line.match(/^\s+(\d+):(\d+)\s+(warning|error)\s+(.+)$/)
    if (m) {
      console.log(`${currentFile}:${m[1]} ${m[4].slice(0, 80)}`)
    }
  }
}
