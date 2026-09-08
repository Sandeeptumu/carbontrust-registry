import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute, RoleRoute } from './components/routing/Guards'
import { roleHome } from './utils/roles'
import AppShell from './components/layout/AppShell'
import NotFoundPage from './pages/common/NotFoundPage'

// Public
import Landing from './pages/landing/Landing'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Buyer
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import MarketplacePage from './pages/buyer/MarketplacePage'
import PurchasesPage from './pages/buyer/PurchasesPage'
import RetirementsPage from './pages/buyer/RetirementsPage'

// NGO
import NgoDashboard from './pages/ngo/NgoDashboard'
import ProjectsPage from './pages/ngo/ProjectsPage'
import ProjectFormPage from './pages/ngo/ProjectFormPage'
import ProjectDetailPage from './pages/ngo/ProjectDetailPage'
import MRVSubmitPage from './pages/ngo/MRVSubmitPage'

// Verifier
import VerifierDashboard from './pages/verifier/VerifierDashboard'
import MRVQueuePage from './pages/verifier/MRVQueuePage'
import HistoryPage from './pages/verifier/HistoryPage'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminProjectsPage from './pages/admin/AdminProjectsPage'
import AdminCreditsPage from './pages/admin/AdminCreditsPage'
import AdminPurchasesPage from './pages/admin/AdminPurchasesPage'

// Health
import PersonalHealthPage from './pages/health/PersonalHealthPage'
import PersonalHealthEditPage from './pages/health/PersonalHealthEditPage'
import HealthcarePage from './pages/health/HealthcarePage'

/** Redirects signed-in users away from public pages. */
function PublicOnly({ children }) {
  const { user, ready } = useAuth()
  if (ready && user) return <Navigate to={roleHome(user.role)} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <PublicOnly>
                  <Landing />
                </PublicOnly>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnly>
                  <RegisterPage />
                </PublicOnly>
              }
            />

            {/* Authenticated application shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                {/* ADMIN */}
                <Route element={<RoleRoute roles={['ADMIN']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/projects" element={<AdminProjectsPage />} />
                  <Route path="/admin/credits" element={<AdminCreditsPage />} />
                  <Route path="/admin/purchases" element={<AdminPurchasesPage />} />
                </Route>

                {/* NGO */}
                <Route element={<RoleRoute roles={['NGO']} />}>
                  <Route path="/ngo" element={<NgoDashboard />} />
                  <Route path="/ngo/dashboard" element={<Navigate to="/ngo" replace />} />
                  <Route path="/ngo/projects" element={<ProjectsPage />} />
                  <Route path="/ngo/projects/new" element={<ProjectFormPage />} />
                  <Route path="/ngo/projects/:projectId/edit" element={<ProjectFormPage />} />
                  <Route path="/ngo/projects/:projectId" element={<ProjectDetailPage />} />
                  <Route path="/ngo/projects/:projectId/mrv/new" element={<MRVSubmitPage />} />
                </Route>

                {/* VERIFIER */}
                <Route element={<RoleRoute roles={['VERIFIER']} />}>
                  <Route path="/verifier" element={<VerifierDashboard />} />
                  <Route path="/verifier/dashboard" element={<Navigate to="/verifier" replace />} />
                  <Route path="/verifier/mrv" element={<MRVQueuePage />} />
                  <Route path="/verifier/projects" element={<Navigate to="/verifier/mrv" replace />} />
                  <Route path="/verifier/history" element={<HistoryPage />} />
                </Route>

                {/* BUYER */}
                <Route element={<RoleRoute roles={['BUYER']} />}>
                  <Route path="/buyer" element={<BuyerDashboard />} />
                  <Route path="/buyer/dashboard" element={<Navigate to="/buyer" replace />} />
                  <Route path="/buyer/marketplace" element={<MarketplacePage />} />
                  <Route path="/buyer/credits" element={<PurchasesPage />} />
                  <Route path="/buyer/purchases" element={<Navigate to="/buyer/credits" replace />} />
                  <Route path="/buyer/retirements" element={<RetirementsPage />} />
                </Route>

                {/* USER (personal health) */}
                <Route element={<RoleRoute roles={['USER', 'HEALTHCARE_ADVISOR']} />}>
                  <Route path="/personal-health" element={<PersonalHealthPage />} />
                  <Route path="/personal-health/edit" element={<PersonalHealthEditPage />} />
                </Route>

                {/* HEALTHCARE_ADVISOR */}
                <Route element={<RoleRoute roles={['HEALTHCARE_ADVISOR']} />}>
                  <Route path="/health" element={<HealthcarePage />} />
                </Route>

                <Route path="/dashboard" element={<Navigate to="/" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
