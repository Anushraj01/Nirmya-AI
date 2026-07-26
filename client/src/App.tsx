import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#0F6E56' }}>Nirmya AI</h1>
      <p>AI-assisted doctor appointment platform starter.</p>
      {user ? <p>Signed in as {user.name} ({user.role})</p> : <p>No active session.</p>}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <a href="/patient" style={{ color: '#1E5B8C' }}>Patient area</a>
        <a href="/doctor" style={{ color: '#1E5B8C' }}>Doctor area</a>
        <a href="/admin" style={{ color: '#1E5B8C' }}>Admin area</a>
        {user && (
          <button type="button" onClick={logout} style={{ cursor: 'pointer' }}>
            Logout
          </button>
        )}
      </div>
    </main>
  )
}

function LoginPage() {
  return <main style={{ padding: '2rem' }}>Login placeholder</main>
}

function UnauthorizedPage() {
  return <main style={{ padding: '2rem' }}>Unauthorized</main>
}

function PatientPage() {
  return <main style={{ padding: '2rem' }}>Patient dashboard</main>
}

function DoctorPage() {
  return <main style={{ padding: '2rem' }}>Doctor dashboard</main>
}

function AdminPage() {
  return <main style={{ padding: '2rem' }}>Admin dashboard</main>
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
          <Route path="/patient" element={<PatientPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
          <Route path="/doctor" element={<DoctorPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
