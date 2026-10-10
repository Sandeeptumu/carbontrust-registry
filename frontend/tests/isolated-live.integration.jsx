// Opt-in live form verification against a disposable local backend and SMTP capture.
import process from 'node:process'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { configure, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, expect, it, vi } from 'vitest'
import App from '../src/App'
const nativeFetch = globalThis.fetch
const jar = new Map()
const address = `browsercheck-${Date.now()}@example.test`
const accountName = `browsercheck${Date.now()}`
const password = randomUUID() + 'Aa1!'
const resetPassword = randomUUID() + 'Bb2!'
const base = process.env.ISOLATED_FRONTEND_URL || 'http://localhost:5188'
if (process.env.ISOLATED_INTEGRATION !== '1' || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Set ISOLATED_INTEGRATION=1 and use a disposable localhost backend only.')
const capture = process.env.ISOLATED_MAIL_CAPTURE || '/tmp/registry-captured-mail.jsonl'
let ui
configure({ getElementError: message => new Error(message) })
const requests = []
vi.stubGlobal('fetch', async (path, options = {}) => {
  const headers = new Headers(options.headers)
  headers.set('Cookie', [...jar].map(([key,value]) => `${key}=${value}`).join('; '))
  const result = await nativeFetch(base + path, { ...options, headers })
  requests.push(`${options.method || 'GET'} ${path.split('?')[0]} ${result.status}`)
  for (const cookie of result.headers.getSetCookie()) {
    const [pair] = cookie.split(';')
    const split = pair.indexOf('=')
    jar.set(pair.slice(0, split), pair.slice(split + 1))
  }
  return result
})
const change = (label, value) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } })
function reload(path) { if (ui) ui.unmount(); window.history.replaceState({}, '', path); ui = render(<App />) }
async function emailLink(mode) {
  let link
  await waitFor(() => {
    const messages = readFileSync(capture, 'utf8').trim().split('\n').map(JSON.parse)
    const message = messages.filter(m => m.to.includes(address) && m.body.includes(`/${mode}?`)).at(-1)
    expect(message).toBeTruthy()
    link = message.body.match(/https?:\/\/[^\s]+/)[0]
    expect(new URL(link).origin).toBe(new URL(base).origin)
  }, { timeout: 15000 })
  return new URL(link)
}
async function signIn(secret) { change('Email address', address); change('Password', secret); fireEvent.click(screen.getByRole('button', { name: 'Sign in', exact: true })); await screen.findByRole('heading', { name: `Welcome back, ${accountName}` }, { timeout: 15000 }) }
afterAll(() => { cleanup(); vi.unstubAllGlobals(); console.log(requests.join('\n')) })
it('real signup, SMTP verification, cookie login, refresh, logout, recovery and password reset', async () => {
  reload('/register')
  change('Username', accountName); change('Email', address); change('Password', password); change('Confirm password', password)
  fireEvent.click(screen.getByRole('button', { name: 'Create account', exact: true }))
  await screen.findByText(/Account created\. Check your email/i, {}, { timeout: 15000 })
  const verify = await emailLink('verify-email')
  reload(verify.pathname + verify.search)
  fireEvent.click(await screen.findByRole('button', { name: 'Verify email', exact: true }))
  await screen.findByText(/Email verified/i, {}, { timeout: 15000 })
  reload('/login'); await signIn(password)
  expect(screen.getByText('User overview', { exact: false })).toBeTruthy()
  reload('/buyer')
  await screen.findByRole('heading', { name: `Welcome back, ${accountName}` }, { timeout: 15000 })
  fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sign out', exact: true }))
  await screen.findByRole('heading', { name: 'Welcome back.' }, { timeout: 15000 })
  reload('/buyer')
  await screen.findByRole('heading', { name: 'Welcome back.' }, { timeout: 15000 })
  reload('/forgot-password'); change('Email address', address)
  fireEvent.click(screen.getByRole('button', { name: 'Send secure link' }))
  const reset = await emailLink('reset-password')
  reload(reset.pathname + reset.search)
  change('Password', resetPassword); change('Confirm password', resetPassword)
  fireEvent.click(screen.getByRole('button', { name: 'Save new password' }))
  await screen.findByText(/Password changed|Password updated/i, {}, { timeout: 15000 })
  reload('/login'); await signIn(resetPassword)
  console.log(JSON.stringify({ isolatedFrontendAccount: address, verified: ['signup','smtp-verification','cookie-login','direct-dashboard-refresh','logout','logout-direct-route-denial','forgot-password','reset-password','new-password-login'] }))
}, 90000)
