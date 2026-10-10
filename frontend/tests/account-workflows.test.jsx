import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecoveryPage from '../src/pages/auth/RecoveryPage'
import AdminUsersPage from '../src/pages/admin/AdminUsersPage'
import { ToastProvider } from '../src/context/ToastContext'
import PurchaseModal from '../src/components/credits/PurchaseModal'
const response = (data, status = 200) => new Response(JSON.stringify(data), { status })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
it('shows an expired reset link error and offers a fresh link without reporting success', async () => {
  vi.stubGlobal('fetch', async (url) => url === '/users/csrf' ? response({ token: 'csrf', headerName: 'X-CSRF-TOKEN' }) : response({ message: 'This link has expired.' }, 400))
  render(<MemoryRouter initialEntries={['/reset-password?token=expired']}><RecoveryPage mode="reset" /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'long-password-example' } })
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'long-password-example' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save new password' }))
  expect((await screen.findByRole('alert')).textContent).toContain('expired')
  expect(screen.getByRole('link', { name: 'Request a new link' }).getAttribute('href')).toBe('/forgot-password')
})
it('saves an admin status change through the server and refreshes its audit history', async () => {
  let status = 'PENDING'
  vi.stubGlobal('fetch', async (url, options) => {
    if (url === '/users/csrf') return response({ token: 'csrf', headerName: 'X-CSRF-TOKEN' })
    if (url.endsWith('/status')) { status = JSON.parse(options.body).status; return response({}) }
    if (url.endsWith('/audit')) return response(status === 'ACTIVE' ? [{ id: 1, actorEmail: 'admin@example.test', action: 'STATUS_CHANGED', detail: 'PENDING to ACTIVE', createdAt: '2026-10-10T10:00:00Z' }] : [])
    return response([{ userId: 2, username: 'A new user', email: 'new@example.test', role: 'USER', accountStatus: status, emailVerified: false, createdAt: '2026-10-10T10:00:00Z' }])
  })
  render(<MemoryRouter><ToastProvider><AdminUsersPage /></ToastProvider></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button', { name: 'Manage A new user' }))
  fireEvent.change(screen.getByLabelText('Account status'), { target: { value: 'ACTIVE' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save status' }))
  await screen.findByText('PENDING to ACTIVE')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save status' }).disabled).toBe(true))
})
it('does not offer a simulated payment when a marketplace batch is viewed', async () => {
  vi.stubGlobal('fetch', async () => response({ projectName: 'Coast', location: 'Estuary', ecosystemType: 'MANGROVE' }))
  render(<MemoryRouter><PurchaseModal open batch={{ ccbId: 1, projectId: 1, projectName: 'Coast', availableQuantity: 40 }} onClose={() => {}} /></MemoryRouter>)
  expect(await screen.findByText(/Purchasing is unavailable/)).toBeTruthy()
  expect(screen.queryByRole('button', { name: /confirm.*purchase/i })).toBeNull()
})

it('issues an administrator-entered quantity and refreshes the real batch table', async () => {
  let issued = false
  vi.stubGlobal('fetch', async (url, options) => {
    if (url === '/users/csrf') return response({ token: 'csrf', headerName: 'X-CSRF-TOKEN' })
    if (url === '/admin/projects') return response([{ projectId: 3, projectName: 'Verified coast', projectStatus: 'VERIFIED' }])
    if (url === '/projects/3/carbon-credits') { const payload = JSON.parse(options.body); if (payload.quantity !== 12) return response({ message: 'Wrong quantity' }, 400); issued = true; return response({ ccbId: 22 }) }
    return response(issued ? [{ ccbId: 22, projectName: 'Verified coast', originalQuantity: 12, availableQuantity: 12, status: 'AVAILABLE', issuedDate: '2026-10-10' }] : [])
  })
  const { default: AdminCreditsPage } = await import('../src/pages/admin/AdminCreditsPage')
  render(<MemoryRouter><ToastProvider><AdminCreditsPage /></ToastProvider></MemoryRouter>)
  fireEvent.change(await screen.findByLabelText('Verified project'), { target: { value: '3' } })
  fireEvent.change(screen.getByLabelText('Verified quantity (tCO₂e)'), { target: { value: '12' } })
  fireEvent.click(screen.getByRole('button', { name: 'Issue credits' }))
  expect(await screen.findByText('BATCH-22')).toBeTruthy()
})
