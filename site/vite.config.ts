import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(__dirname, '..')
const { version } = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))

export default defineConfig({
  plugins: [react()],
  base: '/ai-engineering-harness/',
  define: {
    __HARNESS_VERSION__: JSON.stringify(version),
  },
})
