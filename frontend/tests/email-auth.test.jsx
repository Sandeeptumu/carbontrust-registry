import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import { ToastProvider } from '../src/context/ToastContext'
import RegisterPage from '../src/pages/auth/RegisterPage'
import { api } from '../src/api/client'
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
beforeEach(() => localStorage.clear())
describe('cookie authentication transport', () => {
  it('fetches CSRF before login, sends cookies, and never uses a legacy browser token', async () => {
    localStorage.setItem('carbontrust.token', 'obsolete-token')
    const calls = []
    vi.stubGlobal('fetch', async (url, options) => {
      calls.push({ url, options })
      if (url === '/users/csrf') return response({ token: 'csrf-fixture', headerName: 'X-CSRF-TOKEN' })
      return response({ userId: 7, username: 'Test', role: 'USER', token: null })
    })
    await api.post('/users/login', { email: 'test@example.com', password: 'long-password' }, { auth: false })
    expect(calls.map(c => c.url)).toEqual(['/users/csrf', '/users/login'])
    expect(calls[1].options.credentials).toBe('include')
    expect(calls[1].options.headers['X-CSRF-TOKEN']).toBe('csrf-fixture')
    expect(calls[1].options.headers.Authorization).toBeUndefined()
  })
  it('does not submit a mutation when CSRF retrieval fails', async () => {
    const calls = []
    vi.stubGlobal('fetch', async (url) => { calls.push(url); return response({ message: 'Please try later' }, 503) })
    await expect(api.post('/users/register', {})).rejects.toThrow('Please try later')
    expect(calls).toEqual(['/users/csrf'])
  })
})
describe('email signup', () => {
  it('requires matching passwords and submits only the supported account fields', async () => {
    const submitted = []
    vi.stubGlobal('fetch', async (url, options) => {
      if (url === '/users/me') return response({ message: 'Sign in' }, 401)
      if (url === '/users/csrf') return response({ token: 'csrf', headerName: 'X-CSRF-TOKEN' })
      submitted.push(JSON.parse(options.body))
      return response({ message: 'Check your email to verify your account.' })
    })
    render(<MemoryRouter><ToastProvider><AuthProvider><RegisterPage /></AuthProvider></ToastProvider></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'Forest Friend' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'friend@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'a-long-forest-password' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'different-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await screen.findByText('Passwords do not match')
    expect(submitted).toEqual([])
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'a-long-forest-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(submitted).toEqual([{ username: 'Forest Friend', email: 'friend@example.com', password: 'a-long-forest-password', passwordConfirmation: 'a-long-forest-password' }]))
  })
})

function SessionProbe() {
  const { user, login } = useAuth()
  return <><p>{user?.username || 'Signed out'}</p><button onClick={() => login({ email: 'friend@example.test', password: 'fixture-password' })}>Test login</button></>
}
it('ignores an old restoration response that arrives after a successful login', async () => {
  let resolveRestore
  vi.stubGlobal('fetch', async url => {
    if (url === '/users/me') return new Promise(resolve => { resolveRestore = resolve })
    if (url === '/users/csrf') return response({ token: 'csrf', headerName: 'X-CSRF-TOKEN' })
    return response({ userId: 5, username: 'Forest person', email: 'friend@example.test', role: 'USER', token: null })
  })
  render(<MemoryRouter><ToastProvider><AuthProvider><SessionProbe /></AuthProvider></ToastProvider></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Test login' }))
  await screen.findByText('Forest person')
  await act(async () => { resolveRestore(response({ message: 'Not authenticated' }, 401)) })
  expect(screen.getByText('Forest person')).toBeTruthy()
})
