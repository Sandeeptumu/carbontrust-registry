import { mkdir, cp, writeFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

// Render's assigned URL is deployment configuration, never a browser credential.
const configured = process.env.BACKEND_ORIGIN
if (!configured) throw new Error('Set BACKEND_ORIGIN to the deployed Render HTTPS origin.')
const backend = new URL(configured)
if (backend.protocol !== 'https:' || backend.username || backend.password ||
    backend.pathname !== '/' || backend.search || backend.hash ||
    !backend.hostname.endsWith('.onrender.com')) {
  throw new Error('BACKEND_ORIGIN must be an HTTPS onrender.com origin without a path or credentials.')
}

const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit', env: { ...process.env, VITE_API_URL: '/api' },
})
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

await rm('.vercel/output', { recursive: true, force: true })
await mkdir('.vercel/output/static', { recursive: true })
await cp('dist', '.vercel/output/static', { recursive: true })
await writeFile('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { src: '/(.*)', headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
    }, continue: true },
    { src: '/api/(.*)', dest: `${backend.origin}/$1`, headers: { 'Cache-Control': 'no-store' } },
    { handle: 'filesystem' },
    { src: '/assets/(.*)', status: 404 },
    { src: '/(.*)', dest: '/index.html' },
  ],
}, null, 2))
